/**
 * 用户认证模块
 * 提供登录、注册、密码重置等功能
 * @module auth
 */

document.addEventListener('DOMContentLoaded', () => {
  // 获取当前页面类型
  const currentPath = window.location.pathname;
  const isLoginPage = currentPath.includes('login.html');
  const isRegisterPage = currentPath.includes('register.html');
  const isForgotPasswordPage = currentPath.includes('forgot-password.html');
  const isProfilePage = currentPath.includes('user-profile.html');

  // 如果用户已登录但访问登录页，重定向到用户中心
  if ((isLoginPage || isRegisterPage) && isLoggedIn()) {
    window.location.href = 'user-profile.html';
    return;
  }

  // 如果用户未登录但访问用户中心，重定向到登录页
  if (isProfilePage && !isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }

  // 登录页面逻辑
  if (isLoginPage) {
    setupLoginForm();
  }

  // 注册页面逻辑
  if (isRegisterPage) {
    setupRegisterForm();
  }

  // 忘记密码页面逻辑
  if (isForgotPasswordPage) {
    setupForgotPasswordForm();
  }

  // 如果是用户中心页面，初始化用户信息
  if (isProfilePage) {
    loadUserProfile();
  }

  // 在所有页面上，如果用户已登录，更新导航栏
  updateNavigation();
});

/**
 * 检查用户是否已登录
 * @returns {boolean} 用户登录状态
 */
function isLoggedIn() {
  return localStorage.getItem('user') !== null;
}

/**
 * 设置登录表单相关事件
 */
function setupLoginForm() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;

  // 登录表单提交事件
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // 获取表单数据
    const usernameOrEmail = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const rememberMe = document.getElementById('remember').checked;
    
    // 清除之前的错误提示
    clearErrors();
    
    // 验证表单
    let isValid = true;
    
    if (!usernameOrEmail) {
      showError('username', '请输入用户名或邮箱');
      isValid = false;
    }
    
    if (!password) {
      showError('password', '请输入密码');
      isValid = false;
    }
    
    if (!isValid) return;
    
    // 在实际应用中，这里应该发送请求到服务器验证用户身份
    // 这里仅作模拟演示
    loginUser(usernameOrEmail, password, rememberMe);
  });
}

/**
 * 登录用户
 * @param {string} usernameOrEmail - 用户名或邮箱
 * @param {string} password - 密码
 * @param {boolean} rememberMe - 是否记住登录
 */
function loginUser(usernameOrEmail, password, rememberMe) {
  // 模拟登录请求
  setTimeout(() => {
    // 模拟的用户数据 - 在实际应用中，这应该从服务器获取
    if (usernameOrEmail === 'zhangsan@example.com' && password === 'password123') {
      const user = {
        id: 1,
        username: 'zhangsan',
        email: 'zhangsan@example.com',
        firstName: '张',
        lastName: '三',
        phone: '+86 138 **** 5678',
        company: '张三贸易有限公司',
        avatar: 'https://ui-avatars.com/api/?name=张三&background=3498db&color=fff',
        memberLevel: '黄金会员',
        registeredDate: '2023-10-15'
      };
      
      // 保存用户信息到本地存储
      localStorage.setItem('user', JSON.stringify(user));
      
      // 如果勾选了"记住我"，设置较长的过期时间
      if (rememberMe) {
        localStorage.setItem('auth_expires', Date.now() + 30 * 24 * 60 * 60 * 1000); // 30天
      } else {
        localStorage.setItem('auth_expires', Date.now() + 24 * 60 * 60 * 1000); // 1天
      }
      
      // 重定向到用户中心
      window.location.href = 'user-profile.html';
    } else {
      // 显示登录失败错误
      showError('login-error', '用户名或密码不正确', true);
    }
  }, 800); // 模拟网络延迟
}

/**
 * 设置注册表单相关事件
 */
function setupRegisterForm() {
  const registerForm = document.getElementById('register-form');
  if (!registerForm) return;

  // 密码强度检测
  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    passwordInput.addEventListener('input', updatePasswordStrength);
  }

  // 注册表单提交事件
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // 获取表单数据
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();
    const company = document.getElementById('company').value.trim();
    const agreeTerms = document.getElementById('agree-terms').checked;
    
    // 清除之前的错误提示
    clearErrors();
    
    // 验证表单
    let isValid = validateRegisterForm(firstName, lastName, email, phone, username, password, confirmPassword, agreeTerms);
    
    if (!isValid) return;
    
    // 在实际应用中，这里应该发送请求到服务器创建用户账户
    // 这里仅作模拟演示
    registerUser(firstName, lastName, email, phone, username, password, company);
  });
}

/**
 * 验证注册表单
 * @returns {boolean} 表单是否有效
 */
function validateRegisterForm(firstName, lastName, email, phone, username, password, confirmPassword, agreeTerms) {
  let isValid = true;
  
  if (!firstName) {
    showError('first-name', '请输入名字');
    isValid = false;
  }
  
  if (!lastName) {
    showError('last-name', '请输入姓氏');
    isValid = false;
  }
  
  if (!email) {
    showError('email', '请输入邮箱');
    isValid = false;
  } else if (!isValidEmail(email)) {
    showError('email', '邮箱格式不正确');
    isValid = false;
  }
  
  if (phone && !isValidPhone(phone)) {
    showError('phone', '电话号码格式不正确');
    isValid = false;
  }
  
  if (!username) {
    showError('username', '请输入用户名');
    isValid = false;
  } else if (username.length < 4) {
    showError('username', '用户名至少需要4个字符');
    isValid = false;
  }
  
  if (!password) {
    showError('password', '请输入密码');
    isValid = false;
  } else if (password.length < 8) {
    showError('password', '密码至少需要8个字符');
    isValid = false;
  }
  
  if (!confirmPassword) {
    showError('confirm-password', '请确认密码');
    isValid = false;
  } else if (password !== confirmPassword) {
    showError('confirm-password', '两次输入的密码不一致');
    isValid = false;
  }
  
  if (!agreeTerms) {
    showError('agree-terms', '请阅读并同意用户协议和隐私政策');
    isValid = false;
  }
  
  return isValid;
}

/**
 * 更新密码强度指示器
 */
function updatePasswordStrength() {
  const password = document.getElementById('password').value;
  const strengthBar = document.getElementById('password-strength-bar');
  const strengthText = document.getElementById('password-strength-text');
  
  if (!strengthBar || !strengthText) return;
  
  // 计算密码强度
  let strength = 0;
  
  // 长度检查
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  
  // 复杂性检查
  if (/[A-Z]/.test(password)) strength += 1; // 大写字母
  if (/[a-z]/.test(password)) strength += 1; // 小写字母
  if (/[0-9]/.test(password)) strength += 1; // 数字
  if (/[^A-Za-z0-9]/.test(password)) strength += 1; // 特殊字符
  
  // 设置强度条的宽度和颜色
  let percent = (strength / 6) * 100;
  let color = '';
  let text = '';
  
  if (strength === 0) {
    color = '#e74c3c';
    text = '非常弱';
  } else if (strength <= 2) {
    color = '#e67e22';
    text = '弱';
  } else if (strength <= 4) {
    color = '#f1c40f';
    text = '中等';
  } else if (strength <= 5) {
    color = '#2ecc71';
    text = '强';
  } else {
    color = '#27ae60';
    text = '非常强';
  }
  
  strengthBar.style.width = `${percent}%`;
  strengthBar.style.backgroundColor = color;
  strengthText.textContent = text;
  strengthText.style.color = color;
}

/**
 * 注册新用户
 */
function registerUser(firstName, lastName, email, phone, username, password, company) {
  // 显示加载状态
  const submitButton = document.querySelector('#register-form button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 处理中...';
  }

  // 模拟注册请求
  setTimeout(() => {
    // 模拟成功注册
    const user = {
      id: 1,
      username: username,
      email: email,
      firstName: firstName,
      lastName: lastName,
      phone: phone,
      company: company,
      avatar: `https://ui-avatars.com/api/?name=${firstName}${lastName}&background=3498db&color=fff`,
      memberLevel: '普通会员',
      registeredDate: new Date().toISOString().split('T')[0]
    };
    
    // 保存用户信息到本地存储
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('auth_expires', Date.now() + 24 * 60 * 60 * 1000); // 1天
    
    // 显示成功消息并重定向
    alert('注册成功！即将跳转到用户中心');
    window.location.href = 'user-profile.html';
  }, 1500); // 模拟网络延迟
}

/**
 * 设置忘记密码表单相关事件
 */
function setupForgotPasswordForm() {
  // 步骤指示器初始化
  const steps = document.querySelectorAll('.step');
  let currentStep = 0;
  
  // 验证身份表单
  const verifyForm = document.getElementById('verify-form');
  if (verifyForm) {
    verifyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const emailOrUsername = document.getElementById('email-username').value.trim();
      
      // 验证输入
      if (!emailOrUsername) {
        showError('email-username', '请输入您的邮箱或用户名');
        return;
      }
      
      // 模拟验证请求
      setTimeout(() => {
        // 隐藏当前表单，显示成功信息
        verifyForm.style.display = 'none';
        document.querySelector('.success-message').style.display = 'block';
        
        // 更新步骤指示器
        updateStepIndicator(steps, currentStep, ++currentStep);
        
        // 5秒后显示重置密码表单
        setTimeout(() => {
          document.querySelector('.success-message').style.display = 'none';
          document.getElementById('reset-form').style.display = 'block';
        }, 5000);
      }, 1000);
    });
  }
  
  // 重置密码表单
  const resetForm = document.getElementById('reset-form');
  if (resetForm) {
    resetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const newPassword = document.getElementById('new-password').value.trim();
      const confirmPassword = document.getElementById('confirm-password').value.trim();
      
      // 验证输入
      let isValid = true;
      
      if (!newPassword) {
        showError('new-password', '请输入新密码');
        isValid = false;
      } else if (newPassword.length < 8) {
        showError('new-password', '密码至少需要8个字符');
        isValid = false;
      }
      
      if (!confirmPassword) {
        showError('confirm-password', '请确认新密码');
        isValid = false;
      } else if (newPassword !== confirmPassword) {
        showError('confirm-password', '两次输入的密码不一致');
        isValid = false;
      }
      
      if (!isValid) return;
      
      // 模拟重置密码请求
      setTimeout(() => {
        // 隐藏当前表单，显示完成信息
        resetForm.style.display = 'none';
        document.querySelector('.completion').style.display = 'block';
        
        // 更新步骤指示器
        updateStepIndicator(steps, currentStep, ++currentStep);
      }, 1000);
    });
  }
}

/**
 * 更新步骤指示器
 * @param {NodeList} steps - 步骤指示器DOM元素列表
 * @param {number} prevStep - 当前步骤索引
 * @param {number} nextStep - 下一步骤索引
 */
function updateStepIndicator(steps, prevStep, nextStep) {
  if (steps.length === 0) return;
  
  if (prevStep >= 0 && prevStep < steps.length) {
    steps[prevStep].classList.remove('active');
    steps[prevStep].classList.add('completed');
  }
  
  if (nextStep >= 0 && nextStep < steps.length) {
    steps[nextStep].classList.add('active');
  }
}

/**
 * 加载用户个人资料
 */
function loadUserProfile() {
  const userData = getUserData();
  if (!userData) return;
  
  // 更新顶部个人信息
  const profileName = document.querySelector('.profile-info h1');
  if (profileName) {
    profileName.textContent = `${userData.firstName}${userData.lastName}`;
  }
  
  // 更新头像
  const profileAvatar = document.querySelector('.profile-avatar img');
  if (profileAvatar && userData.avatar) {
    profileAvatar.src = userData.avatar;
  }
  
  // 更新元数据
  const emailElement = document.querySelector('.profile-meta-item:has(i.fa-envelope)');
  if (emailElement) {
    emailElement.querySelector('i + span').textContent = userData.email;
  }
  
  const phoneElement = document.querySelector('.profile-meta-item:has(i.fa-phone)');
  if (phoneElement) {
    phoneElement.querySelector('i + span').textContent = userData.phone;
  }
  
  const companyElement = document.querySelector('.profile-meta-item:has(i.fa-building)');
  if (companyElement && userData.company) {
    companyElement.querySelector('i + span').textContent = userData.company;
  }
}

/**
 * 更新导航栏显示
 */
function updateNavigation() {
  const userData = getUserData();
  if (!userData) return;
  
  // 更新导航栏用户名
  const userNavLink = document.querySelector('.nav-menu .nav-item:last-child .nav-link');
  if (userNavLink) {
    userNavLink.innerHTML = `<i class="fas fa-user-circle"></i> ${userData.firstName}${userData.lastName}`;
  }
}

/**
 * 获取当前登录用户数据
 * @returns {Object|null} 用户数据对象或null
 */
function getUserData() {
  const userJson = localStorage.getItem('user');
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch (e) {
    console.error('Failed to parse user data:', e);
    return null;
  }
}

/**
 * 清除所有错误提示
 */
function clearErrors() {
  const errorMessages = document.querySelectorAll('.error-message');
  errorMessages.forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });
  
  const inputs = document.querySelectorAll('.auth-input');
  inputs.forEach(input => {
    input.classList.remove('error');
  });
}

/**
 * 显示错误提示
 * @param {string} inputId - 输入框ID
 * @param {string} message - 错误信息
 * @param {boolean} [isGlobal=false] - 是否为全局错误
 */
function showError(inputId, message, isGlobal = false) {
  const errorElement = document.getElementById(`${inputId}-error`);
  
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
  
  if (!isGlobal) {
    const inputElement = document.getElementById(inputId);
    if (inputElement) {
      inputElement.classList.add('error');
    }
  }
}

/**
 * 验证邮箱格式
 * @param {string} email - 要验证的邮箱
 * @returns {boolean} 是否是有效的邮箱
 */
function isValidEmail(email) {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
}

/**
 * 验证手机号码格式
 * @param {string} phone - 要验证的手机号码
 * @returns {boolean} 是否是有效的手机号码
 */
function isValidPhone(phone) {
  // 简单的国内手机号格式验证
  const re = /^1[3-9]\d{9}$/;
  return re.test(phone);
}

/**
 * 用户登出
 */
function logout() {
  localStorage.removeItem('user');
  localStorage.removeItem('auth_expires');
  window.location.href = 'login.html';
}

// 处理登出按钮点击事件
document.addEventListener('click', (e) => {
  // 使用事件委托
  if (e.target && e.target.closest('a[href="index.html"].sidebar-menu-link')) {
    e.preventDefault();
    logout();
  }
}); 