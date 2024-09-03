<template>
    <div id="loading">
        <div>
            <div class="loader"></div>
            <p class="message">正在授权，请稍候...</p>
        </div>
    </div>

</template>

<script>



export default {
    name: 'LoadingPage',
    methods: {
        async fetchToken(code, state) {
            let xhr = new XMLHttpRequest();
            xhr.open("GET", `/oauth2/callback?code=${code}&state=${state}`, true);

            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        try {
                            let data = JSON.parse(xhr.responseText);
                            console.log('Token fetched and stored:', data);
                            localStorage.setItem('img', data.avatar_url)
                            if (data.shareType === 'ChatGPT') {
                                this.startGPTChat(data.username, data.jmc)
                            } else if (data.shareType === 'Claude') {
                                this.startClaudeChat(data.username, data.jmc)
                            } else if (data.shareType === 'panel') {
                                this.startPanel(data.username, data.jmc)
                            }

                        } catch (e) {
                            console.error('Error parsing response:', e);
                        }
                    } else {
                        console.error('Request failed with status:', xhr.status);
                        alert('Failed to fetch token');
                    }
                }
            };

            xhr.send();
        },

        async startGPTChat(username, jmc) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", `/pandora/checkUser?username=${username}&jmc=${jmc}`, true);

            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        try {
                            var data = JSON.parse(xhr.responseText);
                            // 获取data中的username
                            if (data.isShared === false) {
                                alert("您的账号未激活，请联系管理员")
                                localStorage.setItem('token', data.token)
                                window.location.href = 'pandora.html';
                            } else {
                                console.log('Token fetched and stored:', data);
                                window.location.href = data.address;
                            }
                        } catch (e) {
                            console.error('Error parsing response:', e);
                            alert('Failed to redirect');
                            window.location.href = 'pandora.html'
                        }
                    } else {
                        console.error('Request failed with status:', xhr.status);
                        alert('您暂时无法访问该页面');
                        window.location.href = 'pandora.html'
                    }
                }
            };

            xhr.send();
        },

        async startClaudeChat(username, jmc) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", `/fuclaude/checkUser?username=${username}&jmc=${jmc}`, true);

            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        try {
                            var status = JSON.parse(xhr.responseText).status;
                            // 获取data中的username
                            if (!status) {
                                alert("您的账号未激活，请联系管理员")
                                window.location.href = 'claude.html';
                            } else {
                                window.location.href = JSON.parse(xhr.responseText).data;
                            }
                        } catch (e) {
                            console.error('Error parsing response:', e);
                            alert('Failed to redirect');
                            window.location.href = 'claude.html'
                        }
                    } else {
                        console.error('Request failed with status:', xhr.status);
                        alert('您暂时无法访问该页面');
                        window.location.href = 'claude.html'
                    }
                }
            };

            xhr.send();
        },

        async startPanel(username, jmc) {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", `/share/checkUser?username=${username}&jmc=${jmc}`, true);

            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        try {
                            var status = JSON.parse(xhr.responseText).status;
                            var msg = JSON.parse(xhr.responseText).message;
                            // 获取data中的username
                            if (!status) {
                                alert(msg)
                                window.location.href = 'index.html';
                            } else {
                                localStorage.setItem('token', JSON.parse(xhr.responseText).data)
                                window.location.href = 'account.html';
                            }
                        } catch (e) {
                            console.error('Error parsing response:', e);
                            alert('Failed to redirect');
                            window.location.href = 'claude.html'
                        }
                    } else {
                        console.error('Request failed with status:', xhr.status);
                        alert('您暂时无法访问该页面');
                        window.location.href = 'index.html'
                    }
                }
            };

            xhr.send();
        },
        async getQueryStringValue(key) {
            return decodeURIComponent(
                window.location.search.replace(
                    new RegExp("^(?:.*[&?]" + encodeURIComponent(key).replace(/[.+*]/g, "\\$&") + "(?:=([^&]*))?)?.*$", "i"),
                    "$1"
                )
            );
        }

    },
    mounted() {
        // 获取url参数
        var code = this.getQueryStringValue("code");
        var state = this.getQueryStringValue("state");
        if (code && state) {
            this.fetchToken(code, state);
        }
    }
}
</script>


<style scoped>
#loading,html {
    height:100%;
    margin-bottom: 0;
    margin: 0;
    font-family: Arial, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f0f0f0;
    color: #333;
}

.loader {
    border: 16px solid #f3f3f3;
    border-radius: 50%;
    border-top: 16px solid #3498db;
    width: 120px;
    height: 120px;
    animation: spin 2s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.message {
    text-align: center;
    font-size: 20px;
    margin-top: 20px;
}
</style>