package com.betpro.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.net.Uri;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

public class MainActivity extends BridgeActivity {
    
    private WebView webView;
    private static final String APP_HOST = "localhost";
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Добавляем обработчик кнопки "Назад"
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView != null) {
                    String currentUrl = webView.getUrl();
                    
                    // Если мы на внешнем сайте - возвращаемся к приложению
                    if (currentUrl != null && isExternalUrl(currentUrl)) {
                        webView.loadUrl("https://localhost/");
                    } else if (webView.canGoBack()) {
                        webView.goBack();
                    } else {
                        setEnabled(false);
                        getOnBackPressedDispatcher().onBackPressed();
                    }
                } else {
                    setEnabled(false);
                    getOnBackPressedDispatcher().onBackPressed();
                }
            }
        });
    }
    
    private boolean isExternalUrl(String url) {
        if (url == null) return false;
        try {
            Uri uri = Uri.parse(url);
            String host = uri.getHost();
            return host != null && !host.equals(APP_HOST) && !host.equals("127.0.0.1");
        } catch (Exception e) {
            return false;
        }
    }
    
    private boolean isAppUrl(String url) {
        if (url == null) return false;
        return url.contains("localhost") || url.contains("127.0.0.1");
    }
    
    @Override
    public void onStart() {
        super.onStart();
        
        webView = getBridge().getWebView();
        
        if (webView != null) {
            WebSettings settings = webView.getSettings();
            
            // Разрешаем смешанный контент
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            settings.setDomStorageEnabled(true);
            settings.setJavaScriptEnabled(true);
            settings.setBlockNetworkImage(false);
            settings.setBlockNetworkLoads(false);
            // LOAD_NO_CACHE: никогда не брать из кэша Android WebView для сетевых запросов
            // Это критично для работы динамических данных с GitHub
            settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
            settings.setSupportZoom(false);
            settings.setBuiltInZoomControls(false);
            
            // Поддержка редиректов
            settings.setJavaScriptCanOpenWindowsAutomatically(true);
            settings.setSupportMultipleWindows(false);
            
            // Расширяем BridgeWebViewClient
            webView.setWebViewClient(new BridgeWebViewClient(getBridge()) {
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    String url = request.getUrl().toString();
                    String scheme = request.getUrl().getScheme();
                    
                    // Для внутренних URL приложения - стандартная логика Capacitor
                    if (isAppUrl(url)) {
                        return super.shouldOverrideUrlLoading(view, request);
                    }
                    
                    // Для HTTP и HTTPS - открываем в этом WebView
                    if (scheme != null && (scheme.equals("http") || scheme.equals("https"))) {
                        view.loadUrl(url);
                        return true;
                    }
                    
                    // Для других схем (intent://, market://, и т.д.) - блокируем
                    // чтобы не открывались внешние приложения
                    return true;
                }
                
                @Override
                @SuppressWarnings("deprecation")
                public boolean shouldOverrideUrlLoading(WebView view, String url) {
                    if (url == null) return false;
                    
                    // Для внутренних URL - стандартная логика
                    if (isAppUrl(url)) {
                        return super.shouldOverrideUrlLoading(view, url);
                    }
                    
                    // Для HTTP/HTTPS - открываем в WebView
                    if (url.startsWith("http://") || url.startsWith("https://")) {
                        view.loadUrl(url);
                        return true;
                    }
                    
                    // Блокируем другие схемы
                    return true;
                }
            });
            
            // Отключаем копирование
            webView.setWebChromeClient(new WebChromeClient());
            webView.setLongClickable(false);
            webView.setOnLongClickListener(v -> true);
        }
    }
}
