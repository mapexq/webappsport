import React, { useState, useEffect } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // Обновляем состояние при изменении src
  useEffect(() => {
    setDidError(false);
    setRetryCount(0);
  }, [props.src]);

  const handleError = () => {
    // Попытка перезагрузки один раз
    if (retryCount < 1 && props.src) {
      setRetryCount(prev => prev + 1);
      // Попробуем перезагрузить с небольшей задержкой
      setTimeout(() => {
        const img = new Image();
        img.onload = () => {
          setDidError(false);
          setRetryCount(0);
        };
        img.onerror = () => {
          setDidError(true);
        };
        img.src = props.src as string;
      }, 500);
    } else {
      setDidError(true);
    }
  }

  const { src, alt, style, className, crossOrigin, referrerPolicy, ...rest } = props

  // Для Unsplash и других внешних источников не используем crossOrigin
  // чтобы избежать CORS ошибок в APK
  const isExternalImage = src?.startsWith('http://') || src?.startsWith('https://');
  const imageProps: React.ImgHTMLAttributes<HTMLImageElement> = {
    src: src,
    alt,
    className,
    style,
    onError: handleError,
    loading: 'lazy',
    ...rest,
  };

  // Добавляем crossOrigin только если явно указан или для локальных ресурсов
  if (crossOrigin !== undefined) {
    imageProps.crossOrigin = crossOrigin;
  } else if (!isExternalImage) {
    // Для локальных изображений можно использовать crossOrigin
    imageProps.crossOrigin = 'anonymous';
  }

  // Добавляем referrerPolicy для внешних изображений
  if (referrerPolicy !== undefined) {
    imageProps.referrerPolicy = referrerPolicy;
  } else if (isExternalImage) {
    // Для внешних изображений используем no-referrer для лучшей совместимости
    imageProps.referrerPolicy = 'no-referrer';
  }

  return didError ? (
    <div
      className={`inline-block bg-zinc-800 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-700/50">
        <img src={ERROR_IMG_SRC} alt={alt || "Error loading image"} {...rest} data-original-url={src} />
      </div>
    </div>
  ) : (
    <img {...imageProps} />
  )
}
