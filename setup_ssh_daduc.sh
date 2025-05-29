#!/bin/bash

KEY_PATH="$HOME/.ssh/id_ed25519_daduc-freelancer"

echo "🔐 Tạo SSH key mới cho tài khoản GitHub daduc-freelancer..."

# Tạo thư mục ~/.ssh nếu chưa có
mkdir -p ~/.ssh

# Tạo SSH key nếu chưa tồn tại
if [ ! -f "$KEY_PATH" ]; then
    ssh-keygen -t ed25519 -C "your_email@example.com" -f "$KEY_PATH" -N ""
    echo "✅ SSH key đã tạo tại: $KEY_PATH"
else
    echo "⚠️ SSH key đã tồn tại tại: $KEY_PATH"
fi

# Add vào SSH agent
eval "$(ssh-agent -s)"
ssh-add "$KEY_PATH"

# Cấu hình SSH config
CONFIG_LINE="Host github-daduc
  HostName github.com
  User git
  IdentityFile $KEY_PATH"

echo "🔧 Đang cập nhật ~/.ssh/config..."

# Kiểm tra xem config đã có chưa
if ! grep -q "Host github-daduc" ~/.ssh/config 2>/dev/null; then
    echo -e "\n$CONFIG_LINE" >> ~/.ssh/config
    echo "✅ Đã thêm alias github-daduc vào ~/.ssh/config"
else
    echo "⚠️ Alias github-daduc đã tồn tại trong ~/.ssh/config"
fi

# Hiển thị public key để copy lên GitHub
echo -e "\n📋 Copy public key sau và dán vào GitHub:"
echo "👉 https://github.com/settings/keys"
echo "------------------------------------------------"
cat "$KEY_PATH.pub"
echo "------------------------------------------------"
