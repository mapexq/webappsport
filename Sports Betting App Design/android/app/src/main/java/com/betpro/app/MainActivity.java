package com.betpro.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebChromeClient;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.view.ActionMode;
import android.view.Menu;
import android.net.Uri;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    
    private WebView webView;
    private String appBaseUrl = null;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Добавляем обработчик кнопки "Назад"
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView != null && webView.canGoBack()) {
                    String currentUrl = webView.getUrl();
                    // Если мы на внешнем сайте - возвращаемся назад в истории
                    if (currentUrl != null && !isAppUrl(currentUrl)) {
                        webView.goBack();
                    } else {
                        // Иначе стандартное поведение
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
    
    private boolean isAppUrl(String url) {
        if (url == null) return true;
        // Проверяем, является ли URL внутренним URL приложения
        return url.startsWith("https://localhost") || 
               url.startsWith("http://localhost") ||
               url.startsWith("capacitor://") ||
               url.startsWith("file://");
    }
    
    @Override
    public void onStart() {
        super.onStart();
        
        // Получаем WebView
        webView = getBridge().getWebView();
        
        if (webView != null) {
            WebSettings settings = webView.getSettings();
            
            // Разрешаем смешанный контент (HTTP и HTTPS)
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            
            // Включаем DOM Storage
            settings.setDomStorageEnabled(true);
            
            // Включаем JavaScript
            settings.setJavaScriptEnabled(true);
            
            // Разрешаем загрузку изображений из любых источников
            settings.setBlockNetworkImage(false);
            settings.setBlockNetworkLoads(false);
            
            // Включаем кэширование
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);
            
            // Отключаем возможность копирования
            webView.setWebChromeClient(new WebChromeClient());
            webView.setLongClickable(false);
            webView.setOnLongClickListener(v -> true);
        }
    }
}
