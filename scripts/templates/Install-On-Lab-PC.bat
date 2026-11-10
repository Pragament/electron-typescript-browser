@echo off
setlocal EnableDelayedExpansion
title Educational Browser - School Lab Installer

echo ========================================================
echo   Educational Browser - School Lab Computer Installer
echo ========================================================
echo.

set "SOURCE_DIR=%~dp0"
if "%SOURCE_DIR:~-1%"=="\" set "SOURCE_DIR=%SOURCE_DIR:~0,-1%"

if not exist "%SOURCE_DIR%\Educational Browser.exe" (
    echo [ERROR] Educational Browser.exe not found in "%SOURCE_DIR%"!
    echo Please make sure this script is kept inside the Educational Browser folder.
    pause
    exit /b 1
)

:: Check for administrative rights
net session >nul 2>&1
if %errorlevel% equ 0 (
    set "INSTALL_DIR=C:\Educational Browser"
    set "IS_ADMIN=1"
    echo [INFO] Running with Administrator privileges.
    echo Target location: !INSTALL_DIR! (Available for all students)
) else (
    set "INSTALL_DIR=%LOCALAPPDATA%\Educational Browser"
    set "IS_ADMIN=0"
    echo [INFO] Running with Standard User privileges.
    echo Target location: !INSTALL_DIR!
)

:: If already running from INSTALL_DIR, skip copying
if /I "%SOURCE_DIR%"=="%INSTALL_DIR%" (
    echo [INFO] Already running from installation directory.
    goto CREATE_SHORTCUTS
)

echo.
echo [1/2] Copying application files to %INSTALL_DIR%...
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%" >nul 2>&1

xcopy "%SOURCE_DIR%\*" "%INSTALL_DIR%\" /E /Y /I /Q >nul 2>&1

if not exist "%INSTALL_DIR%\Educational Browser.exe" (
    echo [ERROR] Copy failed. Trying robocopy...
    robocopy "%SOURCE_DIR%" "%INSTALL_DIR%" /E /R:1 /W:1 >nul 2>&1
)

if not exist "%INSTALL_DIR%\Educational Browser.exe" (
    echo [ERROR] Could not copy files to %INSTALL_DIR%.
    echo Please run this script by right-clicking and selecting "Run as administrator".
    pause
    exit /b 1
)

echo [OK] Application files successfully installed!

:CREATE_SHORTCUTS
echo.
echo [2/2] Creating Desktop and Start Menu shortcuts...

set "TARGET=%INSTALL_DIR%\Educational Browser.exe"
set "WORKDIR=%INSTALL_DIR%"
set "ICON=%INSTALL_DIR%\Educational Browser.exe"

set "VB_SCRIPT=%TEMP%\create_shortcut_%RANDOM%.vbs"
(
    echo Set oWS = WScript.CreateObject("WScript.Shell"^)
    echo sUserDesktop = oWS.SpecialFolders("Desktop"^)
    echo Set oLink = oWS.CreateShortcut(sUserDesktop ^& "\Educational Browser.lnk"^)
    echo oLink.TargetPath = "%TARGET%"
    echo oLink.WorkingDirectory = "%WORKDIR%"
    echo oLink.IconLocation = "%ICON%,0"
    echo oLink.Description = "Educational Browser for Students"
    echo oLink.Save
    echo On Error Resume Next
    echo sAllUsersDesktop = oWS.SpecialFolders("AllUsersDesktop"^)
    echo If sAllUsersDesktop ^<^> "" Then
    echo     Set oCommonLink = oWS.CreateShortcut(sAllUsersDesktop ^& "\Educational Browser.lnk"^)
    echo     oCommonLink.TargetPath = "%TARGET%"
    echo     oCommonLink.WorkingDirectory = "%WORKDIR%"
    echo     oCommonLink.IconLocation = "%ICON%,0"
    echo     oCommonLink.Description = "Educational Browser for Students"
    echo     oCommonLink.Save
    echo End If
    echo sPrograms = oWS.SpecialFolders("Programs"^)
    echo If sPrograms ^<^> "" Then
    echo     Set oProgLink = oWS.CreateShortcut(sPrograms ^& "\Educational Browser.lnk"^)
    echo     oProgLink.TargetPath = "%TARGET%"
    echo     oProgLink.WorkingDirectory = "%WORKDIR%"
    echo     oProgLink.IconLocation = "%ICON%,0"
    echo     oProgLink.Description = "Educational Browser for Students"
    echo     oProgLink.Save
    echo End If
    echo sAllUsersPrograms = oWS.SpecialFolders("AllUsersPrograms"^)
    echo If sAllUsersPrograms ^<^> "" Then
    echo     Set oCommonProgLink = oWS.CreateShortcut(sAllUsersPrograms ^& "\Educational Browser.lnk"^)
    echo     oCommonProgLink.TargetPath = "%TARGET%"
    echo     oCommonProgLink.WorkingDirectory = "%WORKDIR%"
    echo     oCommonProgLink.IconLocation = "%ICON%,0"
    echo     oCommonProgLink.Description = "Educational Browser for Students"
    echo     oCommonProgLink.Save
    echo End If
) > "%VB_SCRIPT%"

cscript //nologo "%VB_SCRIPT%"
del "%VB_SCRIPT%" >nul 2>&1

echo [OK] Desktop and Start Menu icons created!

echo.
echo ========================================================
echo   SUCCESS! Educational Browser is installed.
echo ========================================================
echo   - Installed to: %INSTALL_DIR%
echo   - Desktop shortcut: "Educational Browser"
echo   - Students can now double-click the desktop icon to start!
echo   - No Node.js, terminal, or coding tools required!
echo.
if /I not "%~1"=="/silent" (
    echo Press any key to finish...
    pause >nul
)
