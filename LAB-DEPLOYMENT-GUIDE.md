# Educational Browser - School Computer Lab Deployment Guide

This application is packaged as a 100% standalone Windows executable. 
**Student computers do NOT need Node.js, VS Code, npm, Python, Git, or any developer tools.**

---

## 📦 What Files You Need to Distribute

Everything needed for the student computers is located inside:
```text
release-builds\Educational Browser-win32-x64\
```

Inside that folder, the key deployment tools are:
- **`Install-On-Lab-PC.bat`** *(Recommended)*: Installs the browser permanently into `C:\Educational Browser`, creates the Desktop shortcut on **all student profiles**, and creates a Start Menu shortcut.
- **`Create-Desktop-Shortcut.bat`**: Creates an instant Desktop shortcut pointing directly to the current folder (great if keeping the folder in a custom location).
- **`Uninstall-Lab-PC.bat`**: Cleanly removes all shortcuts from the student computer.
- **`Educational Browser.exe`**: The standalone application.

---

## 🚀 Method 1: USB Flash Drive (Fastest for 5–20 PCs)

### Step 1: Copy to your USB Drive
1. Insert your USB flash drive into your main computer.
2. Copy the entire folder:
   ```text
   release-builds\Educational Browser-win32-x64
   ```
   onto your USB drive (you can rename the folder on your USB drive to `Educational Browser` if you like).

### Step 2: Install on Each Student PC (Takes 15 seconds)
1. Plug the USB flash drive into the student PC.
2. Open the USB drive and open the `Educational Browser` folder.
3. Right-click **`Install-On-Lab-PC.bat`** and click **Run as administrator** (or double-click it directly).
4. The script will automatically:
   - Copy the files to `C:\Educational Browser\` on the PC hard drive.
   - Place an **Educational Browser** icon on the Windows Desktop for **All Student Users**.
   - Add a shortcut to the Windows Start Menu.
5. Unplug the USB drive. You are done! The app is permanently installed on that PC.

---

## 🌐 Method 2: School Network Shared Drive (LAN Server)

If your school lab has a shared local server or NAS (e.g., `\\School-Server\Share\`):

### Step 1: Place on the Network Share
1. Copy `Educational Browser-win32-x64` to the shared network folder:
   `\\School-Server\Apps\Educational Browser`
2. Ensure read permissions are granted to the lab computers or students.

### Step 2: Install on Student Computers
On each student computer (or in your startup script):
- Navigate to `\\School-Server\Apps\Educational Browser`
- Double-click **`Install-On-Lab-PC.bat`**.
- It copies the files locally to `C:\Educational Browser` so students don't depend on network bandwidth while running the browser.

---

## ⚡ Method 3: Remote Mass Deployment (PowerShell / Active Directory / PDQ)

If your school lab uses IT management software (like LanSchool, NetSupport, PDQ Deploy, or Active Directory GPO):

Run this 1-line silent command across all student machines:
```cmd
robocopy "\\School-Server\Apps\Educational Browser" "C:\Educational Browser" /E /ZB & call "C:\Educational Browser\Install-On-Lab-PC.bat" /silent
```
This deploys and creates the desktop icons on all lab computers silently without needing physical access.

---

## 👨‍🎓 Student Experience
1. Student sits down and turns on the PC.
2. Double-clicks the **Educational Browser** icon on the desktop.
3. The browser launches directly into fullscreen mode with class code verification ready.

---

## 🔄 How to Re-Package After Making Future Changes
Whenever you modify your TypeScript or HTML/CSS code on your development computer:
1. Run:
   ```bash
   npm run package-win
   ```
   *(Or double-click `CREATE-LAB-SHORTCUT.bat` in the project root)*
2. This automatically compiles the code, builds the new `Educational Browser-win32-x64`, and copies the installer batch scripts into the folder ready for distribution.
3. To package into a single `.zip` file for emailing or uploading to Google Drive/OneDrive, run:
   ```bash
   npm run zip-lab
   ```
