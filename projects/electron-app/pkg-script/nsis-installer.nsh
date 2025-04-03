;Inspired by:
; https://gist.github.com/bogdibota/062919938e1ed388b3db5ea31f52955c
; https://stackoverflow.com/questions/34177547/detect-if-visual-c-redistributable-for-visual-studio-2013-is-installed
; https://stackoverflow.com/a/54391388
; https://github.com/GitCommons/cpp-redist-nsis/blob/main/installer.nsh

;Find latests downloads here:
; https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist

!include LogicLib.nsh

; https://github.com/electron-userland/electron-builder/issues/1122
!ifndef BUILD_UNINSTALLER
  Function checkVCRedist
    ReadRegDWORD $0 HKLM "SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64" "Installed"
  FunctionEnd
!endif

!macro customInit
  Push $0
  Call checkVCRedist
  ${If} $0 != "1"
    MessageBox MB_YESNO "\
      NOTE: ${PRODUCT_NAME} requires $\r$\n\
      'Microsoft Visual C++ Redistributable'$\r$\n\
      to function properly.$\r$\n$\r$\n\
      Download and install now?" /SD IDYES IDYES InstallVCRedist IDNO DontInstall
    InstallVCRedist:
      inetc::get /CAPTION " " /BANNER "Downloading Microsoft Visual C++ Redistributable..." "https://aka.ms/vs/17/release/vc_redist.x64.exe" "$TEMP\vc_redist.x64.exe"
      ExecWait "$TEMP\vc_redist.x64.exe /install /norestart"
      ;IfErrors InstallError ContinueInstall ; vc_redist exit code is unreliable :(
      Call checkVCRedist
      ${If} $0 == "1"
        Goto ContinueInstall
      ${EndIf}

    ;InstallError:
      MessageBox MB_ICONSTOP "\
        There was an unexpected error installing$\r$\n\
        Microsoft Visual C++ Redistributable.$\r$\n\
        The installation of ${PRODUCT_NAME} cannot continue."
    DontInstall:
      Abort
  ${EndIf}
  ContinueInstall:
    Pop $0
!macroend