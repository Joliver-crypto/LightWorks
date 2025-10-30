# LightWorks School Computer Deployment Guide

## 🔑 GitHub Authentication for School Computers

### **Recommended: Personal Access Token**

1. **Create a Personal Access Token:**
   - Go to [GitHub.com](https://github.com) → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token (classic)"
   - Name: "LightWorks School Computer"
   - Expiration: 1 year (recommended)
   - Scopes: Check `repo` (Full control of private repositories)
   - Click "Generate token"
   - **Copy the token immediately** (you won't see it again!)

2. **Deploy to School Computer:**

   **Option A: Set environment variable (Recommended)**
   ```cmd
   REM Windows Command Prompt
   set GITHUB_TOKEN=your_token_here
   powershell -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/justinoliver/LightWorks/main/setup-lab-computer.bat' -OutFile 'setup-lab-computer.bat'; .\setup-lab-computer.bat"
   ```

   **Option B: PowerShell (Windows)**
   ```powershell
   $env:GITHUB_TOKEN="your_token_here"
   Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/justinoliver/LightWorks/main/setup-lab-computer.bat' -OutFile 'setup-lab-computer.bat'
   .\setup-lab-computer.bat
   ```

   **Option C: Linux/macOS**
   ```bash
   export GITHUB_TOKEN="your_token_here"
   curl -fsSL https://raw.githubusercontent.com/justinoliver/LightWorks/main/setup-lab-computer.sh | bash
   ```

### **Alternative: Username/Password (Less Secure)**
```cmd
set GITHUB_USERNAME=your_username
set GITHUB_PASSWORD=your_password
powershell -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/justinoliver/LightWorks/main/setup-lab-computer.bat' -OutFile 'setup-lab-computer.bat'; .\setup-lab-computer.bat"
```

### **Simplest: Make Repository Public**
1. Go to your GitHub repository → Settings → General
2. Scroll to "Danger Zone" → Change repository visibility
3. Select "Make public"
4. Deploy without authentication:
   ```cmd
   powershell -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/justinoliver/LightWorks/main/setup-lab-computer.bat' -OutFile 'setup-lab-computer.bat'; .\setup-lab-computer.bat"
   ```

## 🏫 School Network Considerations

### **Common School Restrictions:**
- ❌ SSH connections (port 22) - Most schools block this
- ❌ Git over SSH - Usually blocked
- ✅ HTTPS (port 443) - Usually allowed
- ✅ GitHub.com - Usually accessible

### **Why Personal Access Token is Best:**
- ✅ Uses HTTPS (port 443) - rarely blocked
- ✅ More secure than passwords
- ✅ Can be easily revoked
- ✅ Works through most school firewalls

## 🚀 Quick Deployment Steps

### **Step 1: Get Authentication**
Choose one method above (Personal Access Token recommended)

### **Step 2: Deploy to School Computer**
```cmd
REM Set your token (replace with actual token)
set GITHUB_TOKEN=ghp_your_actual_token_here

REM Download and run setup
powershell -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/justinoliver/LightWorks/main/setup-lab-computer.bat' -OutFile 'setup-lab-computer.bat'; .\setup-lab-computer.bat"
```

### **Step 3: Verify Installation**
- Check that `LightWorks.bat` appears on Desktop
- Double-click to run LightWorks
- Test serial port connection if needed

## 🔄 Updating on School Computer

### **Automatic Update (if using GitHub method):**
```cmd
cd %USERPROFILE%\LightWorks
update-lightworks.bat
```

### **Manual Update:**
1. Download new version from GitHub
2. Replace the LightWorks folder
3. Run setup again

## 🛠️ Troubleshooting School Networks

### **"Repository not found" Error**
- Check if token is correct
- Verify repository is accessible
- Try making repository public temporarily

### **"Connection refused" Error**
- School may block GitHub
- Try using mobile hotspot
- Contact IT department

### **"Permission denied" Error**
- Run Command Prompt as Administrator
- Check file permissions
- Ensure antivirus isn't blocking

### **"Node.js not found" Error**
- Download Node.js from [nodejs.org](https://nodejs.org/)
- Install with default settings
- Restart computer after installation

## 🔐 Security Best Practices

### **For School Use:**
- Use Personal Access Token (not password)
- Set token expiration to 1 year
- Revoke token when no longer needed
- Don't share token with others

### **Token Management:**
- Store token securely (password manager)
- Use different tokens for different purposes
- Regularly rotate tokens
- Monitor token usage in GitHub settings

## 📞 Getting Help

### **If Setup Fails:**
1. Check error messages carefully
2. Verify internet connection
3. Try making repository public temporarily
4. Contact school IT if GitHub is blocked

### **Common Solutions:**
- **"Git not found"** → Install Git from [git-scm.com](https://git-scm.com/)
- **"Node.js not found"** → Install Node.js from [nodejs.org](https://nodejs.org/)
- **"Permission denied"** → Run as Administrator
- **"Repository not found"** → Check token or make repo public

---

**Need help?** Open an issue on GitHub or contact the development team with:
- Operating system and version
- Error messages
- School network restrictions (if known)


