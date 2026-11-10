@echo off
setlocal
title Educational Browser - Uninstaller

echo ========================================================
echo   Educational Browser - Remove from this PC
echo ========================================================
echo.

set /p CONFIRM="Are you sure you want to uninstall Educational Browser? (Y/N): "
if /I not "%CONFIRM%"=="Y" exit /b 0

:: Close running process if any
taskkill /F /IM "Educational Browser.exe" >nul 2>&1

:: Remove shortcuts
set "VB_SCRIPT=%TEMP%\remove_shortcuts_%RANDOM%.vbs"
(
    echo Set oWS = WScript.CreateObject("WScript.Shell"^)
    echo Set oFSO = WScript.CreateObject("Scripting.FileSystemObject"^)
    echo On Error Resume Next
    echo oFSO.DeleteFile oWS.SpecialFolders("Desktop"^) ^& "\Educational Browser.lnk", True
    echo oFSO.DeleteFile oWS.SpecialFolders("AllUsersDesktop"^) ^& "\Educational Browser.lnk", True
    echo oFSO.DeleteFile oWS.SpecialFolders("Programs"^) ^& "\Educational Browser.lnk", True
    echo oFSO.DeleteFile oWS.SpecialFolders("AllUsersPrograms"^) ^& "\Educational Browser.lnk", True
) > "%VB_SCRIPT%"
cscript //nologo "%VB_SCRIPT%"
del "%VB_SCRIPT%" >nul 2>&1

echo.
echo [OK] Shortcuts removed from Desktop and Start Menu.
echo If installed in C:\Educational Browser or %%LOCALAPPDATA%%\Educational Browser,
echo you can now delete the folder to completely remove all files.
echo.
pause
