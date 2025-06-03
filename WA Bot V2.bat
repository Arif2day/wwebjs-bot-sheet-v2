@echo off
setlocal EnableDelayedExpansion

:: Define the search prefix and target env file
set "prefix=wweb-bot-sheet"
set "envFile=.env"
set "key=GKFP"
set "tempFile=%envFile%.tmp"
set "foundFile="
set "updated=0"

:: Step 1: Find the first matching file
set "foundFile="
for /f %%F in ('dir /b /a:-d "%prefix%*"') do (
    set "foundFile=%%F"
    goto :found
)

:found
if not defined foundFile (
    echo No file starting with "%prefix%" found.
    exit /b 1
)

(
    set "blankLineAdded=0"
    for /f "usebackq delims=" %%L in ("%envFile%") do (
        set "line=%%L"
        echo !line! | findstr /b /c:"%key%=" >nul
        if !errorlevel! equ 0 (
            if !blankLineAdded! equ 0 echo.
            echo %key%="%foundFile%"
            set "updated=1"
            set "blankLineAdded=1"
        ) else (
            echo !line!
        )
    )

    if "!updated!"=="0" (
        echo.
        echo %key%="%foundFile%"
    )
) > "%tempFile%"

move /Y "%tempFile%" "%envFile%" >nul


@echo on
cd /d "C:\wwebjs-bot-sheet-v2"
call npm start
echo Exit code: %ERRORLEVEL%
pause