# Widget Jornada Pro en iOS

La Widget Extension **JornadaWidget** está creada e integrada en el proyecto. Incluye:

- **Plugin WidgetData** en la app (mismo API que en Android).
- Esquema de URL `jornadapro://iniciar` y `jornadapro://terminar` para abrir la app desde el widget.
- **Target JornadaWidget** en Xcode con código Swift (WidgetKit + SwiftUI).

## Estructura creada

- `ios/App/JornadaWidget/JornadaWidget.swift` — implementación del widget (barra de avance, texto, botones Iniciar/Terminar).
- `ios/App/JornadaWidget/Info.plist` — configuración de la extensión.
- `ios/App/JornadaWidget/JornadaWidget.entitlements` — App Group `group.com.jornadapro.navantia`.

El target **JornadaWidget** está añadido al proyecto y se embebe en la app. Requiere **iOS 14+** (WidgetKit).

## Qué hacer en Xcode

1. Abre el proyecto: `ios/App/App.xcworkspace` (tras `pod install` si usas CocoaPods).
2. **App Group**: en el target **App** y en el target **JornadaWidget**, comprueba en **Signing & Capabilities** que esté activado el App Group `group.com.jornadapro.navantia` (la app usa `App/App.entitlements` y el widget `JornadaWidget/JornadaWidget.entitlements`, ya configurados).
3. Compila y ejecuta la app en un dispositivo o simulador iOS 14+.
4. Añade el widget: mantén pulsado en la pantalla de inicio → **+** → busca «Jornada Pro» y añade el widget.

## Datos del widget

La app escribe en `UserDefaults(suiteName: "group.com.jornadapro.navantia")`:

- `progress` (Int): 0–100.
- `label` (String): texto de la barra.
- `can_start` (Bool): mostrar «Iniciar jornada».
- `can_finish` (Bool): mostrar «Terminar jornada».

Al tocar los enlaces del widget se abre la app con `jornadapro://iniciar` o `jornadapro://terminar` y la web ejecuta la acción correspondiente.
