package com.betpro.app;

import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebChromeClient;
import android.webkit.WebViewClient;
import android.view.ActionMode;
import android.view.Menu;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onStart() {
        super.onStart();
        
        // Настройки WebView для загрузки внешних изображений
        WebView webView = getBridge().getWebView();
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
            
            // Отключаем возможность копирования через блокировку ActionMode
            webView.setWebChromeClient(new WebChromeClient());
            webView.setLongClickable(false);
            webView.setOnLongClickListener(v -> true);
        }
    }
}
