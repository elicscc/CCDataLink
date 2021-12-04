; HM NIS Edit Wizard helper defines
!include "MUI2.nsh"

; ; MUI Settings
!define MUI_ABORTWARNING

; 欢迎页面
!insertmacro MUI_PAGE_WELCOME

ShowInstDetails show
ShowUnInstDetails show
SpaceTexts show

!macro customInstall

  CreateDirectory "C:\Program Files\DLTOpenJDK\jdk8"
  CreateDirectory "C:\Program Files\DLTOpenJDK\dlt_db"

  CopyFiles "$INSTDIR\resources\static\jdk8\*.*" "C:\Program Files\DLTOpenJDK\jdk8"
  CopyFiles "$INSTDIR\resources\static\dlt_db\*.*" "C:\Program Files\DLTOpenJDK\dlt_db"

  ; 如果系统为64位，安装vc++ x64;否则安装vc++ x86
  ${if} ${RunningX64}
    ExecWait '"$INSTDIR\resources\static\customNsis\vcredist_x64.exe" /q' # silent install
  ${else}
    ExecWait '"$INSTDIR\resources\static\customNsis\vcredist_x86.exe" /q'
  ${endif}

!macroend
