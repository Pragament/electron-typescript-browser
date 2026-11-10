@echo off
setlocal
title Educational Browser - Create Desktop Shortcut

echo ========================================================
echo   Educational Browser - 1-Click Desktop Setup
echo ========================================================
echo.

set "TARGET=%~dp0release-builds\Educational Browser-win32-x64\Educational Browser.exe"
set "WORKDIR=%~dp0release-builds\Educational Browser-win32-x64"
set "ICON=%TARGET%"

if not exist "%TARGET%" (
    echo [INFO] Standalone executable not found yet. Building it now...
    call npm run package-win
)

if not exist "%TARGET%" (
    echo [ERROR] Could not find or build Educational Browser.exe!
    pause
    exit /b 1
)

:: Create a temporary VBScript to create the shortcut reliably
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
) > "%VB_SCRIPT%"

cscript //nologo "%VB_SCRIPT%"
del "%VB_SCRIPT%" >nul 2>&1

echo.
echo ========================================================
echo   SUCCESS! "Educational Browser" is now on your Desktop.
echo   Students can now open the app with 1 click!
echo   No IDE, no terminal, and no coding tools required.
echo ========================================================
echo.
pause
