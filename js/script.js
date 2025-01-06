document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const backgroundImageInput = document.getElementById('backgroundImage');
    const backgroundElement = document.getElementById('background');

    // 处理背景图片上传
    backgroundImageInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                backgroundElement.style.backgroundImage = `url('${e.target.result}')`;
            };
            reader.readAsDataURL(file);
        }
    });

    // 处理登录表单提交
    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();

        // 可替换实际的登录验证逻辑
        const usernameInput = document.getElementById('username').value;
        const passwordInput = document.getElementById('password').value;

        // 定义多个用户名和密码的数组
        const users = [
            { username: '邓文雅', password: '080302' },
            { username: 'user', password: '123456' }
        ];

        // 验证用户名和密码
        let loginSuccessful = false;
        for (let user of users) {
            if (usernameInput === user.username && passwordInput === user.password) {
                loginSuccessful = true;
                break;
            }
        }

        if (loginSuccessful) {
            alert('登录成功！');
            window.location.href = './index2.html';
        } else {
            alert('用户名或密码错误！');
        }

    });
});
