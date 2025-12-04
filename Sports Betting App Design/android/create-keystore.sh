#!/bin/bash

echo "========================================"
echo "Создание keystore для подписи приложения"
echo "========================================"
echo ""
echo "Вам нужно будет ввести:"
echo "- Пароль для keystore (минимум 6 символов)"
echo "- Пароль для ключа (может быть таким же)"
echo "- Ваше имя и организацию"
echo ""
echo "ВАЖНО: Сохраните эти пароли в безопасном месте!"
echo "Они понадобятся для всех будущих обновлений приложения."
echo ""
read -p "Нажмите Enter для продолжения..."

cd app

keytool -genkey -v -keystore betpro-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias betpro

echo ""
echo "========================================"
echo "Keystore создан!"
echo "========================================"
echo ""
echo "Теперь создайте файл keystore.properties в папке android/"
echo "и заполните его данными из keystore.properties.example"
echo ""

