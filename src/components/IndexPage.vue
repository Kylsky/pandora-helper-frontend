<template>
    <div id="app">
        <div class="login-container">
            <h1 style="margin-left: 10px">Panel<span class="toggle-icon" @click="switchToIndex()"><img
                        src="../assets/ph--user-switch.svg" title="切换至Pandora" alt="hi"></span></h1>
            <form @submit.prevent="userlogin()">
                <input type="text" id="username" placeholder="用户名" required>
                <input type="password" id="password" placeholder="密码" required>
                <button type="submit"><span class="btn-text">登录</span><span class="spinner"></span></button>
            </form>
            <div class="divider "><span>OR</span></div>
            <div class="alternative-login">
                <div class="oauth-buttons">
                    <img src="../assets/linuxdo.webp" alt="LINUX DO" @click="initiateOAuth()">
                </div>
                <button type="button" @click="reset()">重置密码</button>
            </div>
            <div class="footer" @click="index()">
                <a href="https://github.com/Kylsky/pandora-helper-with-linux-do-oauth" target="_blank">Powered by Yeelo</a>
            </div>
        </div>
    </div>
</template>

<script>
import config from '../configs/config'
import apiClient from '../configs/axios'
export default {
    name: 'IndexPage',
    props: {

    },
    data() {
        return {

        };
    },
    methods: {

        reset() {
            this.$router.replace({ name: 'reset' });
        },

        async userlogin() {
            var spinner = document.querySelector('.spinner');
            var btnText = document.querySelector('.btn-text');
            btnText.style.visibility = 'hidden'; // 隐藏按钮文本
            spinner.style.display = 'block'; // 显示加载图标
            var username = document.getElementById('username').value;
            var password = document.getElementById('password').value;

            try {
                const response = await apiClient.post(`${config.apiBaseUrl}/user/login`, {
                    username: username,
                    password: password,
                });

                this.loading = false;
                const status = response.data.status;
                if (!status) {
                    alert(response.data.message);
                    spinner.style.display = 'none'; // 隐藏加载图标
                    btnText.style.visibility = 'visible'; // 显示按钮文本
                    return false;
                }
                const user = response.data;
                const token = user.data.jwt;
                const avatar = user.data.avatarUrl;
                localStorage.setItem("token", token)
                if (avatar) {
                    localStorage.setItem("img", avatar)
                }
                spinner.style.display = 'none'; // 隐藏加载图标
                btnText.textContent = '登录成功,跳转中...'; // 修改按钮文本为“跳转中”
                btnText.style.visibility = 'visible'; // 显示按钮文本
                this.$router.replace({ name: 'navi' });
            } catch (error) {
                spinner.style.display = 'none'; // 隐藏加载图标
                btnText.style.visibility = 'visible'; // 显示按钮文本
                var response = response
                alert(response);
            }
        },

        async initiateOAuth() {
            try {
                const response = await apiClient.get(`${config.apiBaseUrl}/oauth2/initiate?type=panel`);

                var data = response;
                console.log(data)
                if (data.data) {
                    window.location = data.data;  // 进行重定向
                } else {
                    console.error('No redirect URL provided');
                }
            } catch (error) {
                console.error('Request failed with status:', error);
            }
        },

        switchToIndex() {
            this.$router.replace({ name: 'pandora' });
        }
    }


}
</script>

<style scoped>

#app {
    font-family: Arial, sans-serif;
    background: linear-gradient(135deg, #ffffff 0%, #185a9d 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
}

.login-container {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    padding: 40px;
    width: 300px;
}

h1 {
    text-align: center;
    color: #333;
    margin-bottom: 30px;
}

input {
    width: 100%;
    padding: 15px;
    margin-bottom: 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
}

.oauth-buttons {
    display: flex;
    justify-content: space-around;
    margin-top: 10px;
    margin-bottom: 10px;
}

.oauth-buttons img {
    width: 30px;
    height: 30px;
    cursor: pointer;
}

button {
    width: 100%;
    padding: 10px;
    background-color: #f0ad5e;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s ease;
}

button:hover {
    background-color: #f0ad9e;
}

.divider::before,
.divider::after {
    content: '';
    flex: 1;
    margin-left: 7px;
    margin-right: 7px;
    border-bottom: 1px solid #ccc;
}

.divider {
    display: flex;
    align-items: center;
    text-align: center;
    margin: 20px 0;
}

.alternative-login {
    text-align: center;
}

.alternative-login button {
    background-color: white;
    color: #333;
    border: 1px solid #ddd;
    margin-bottom: 10px;
    transition: background-color 0.3s ease;
}

.alternative-login button:hover {
    background-color: #f5f5f5;
}

.footer {
    text-align: center;
    margin-top: 20px;
    color: #888;
    font-size: 12px;
}

.spinner {
    display: none;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3498db;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    position: absolute;
    top: 50%;
    left: 50%;
    margin-top: 1px;
    margin-left: -13px;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.btn-text {
    visibility: visible;
}

#loginForm {
    position: fixed;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%);
    /*border: solid white;*/
    padding: 40px; /* 增加填充来使弹窗更大 */
    /*box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);*/
    background: white;
    display: none;
    width: 300px; /* 增加宽度 */
    height: auto; /* 自动调整高度 */
    z-index: 1000; /* 确保弹窗位于最顶层 */
}


.toggle-icon {
    margin-left: 10px;
    cursor: pointer;
    /*vertical-align: super;*/
}
.toggle-icon:hover {
    opacity: 0.7;
}

</style>


