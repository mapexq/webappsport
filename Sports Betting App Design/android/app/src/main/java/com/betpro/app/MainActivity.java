package com.betpro.app;

import android.webkit.WebSettings;
import android.webkit.WebView;
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
        }
    }
}
