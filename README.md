# Gefügerechner für Stähle

Werkzeugdeck / Werkstofftechnik / Simulation. Statische Browseranwendung, keine Laufzeitabhängigkeiten; Berechnung in einem lokalen Modul-Worker.

Workflow: Werkstoffgruppe und Stahl auswählen → sofort TTT/CCT-Modellkurven bzw. verfügbare Herstellerreferenz ansehen → Prozesspreset bearbeiten → Platte oder langen Rundstab berechnen → Zeit, Ort und Ansicht wählen → lokal exportieren.

## Datenlage

Die Kinetik ist ein **unkalibriertes Lehrmodell**, kein validierter Prozessauslegungsrechner. Herstellerlinks machen die Modellkurven nicht zu Messdaten. Modellstahl: 0,02–2,00 Massen-% C; Kinetik nur bis 0,80 %. C45, 42CrMo4 und 16MnCr5 verwenden repräsentative Analysen. Hochlegierte Werkzeugstähle K110/D2, W302/H13 und S600/M2 bleiben im Referenzmodus mit Temperaturrechnung. Kein Aufkohlen, keine Karbidkinetik, Sekundärhärtung oder NE-Legierungen.

Quellen, Modellgleichungen, Koeffizienten, Werkstoffbedingungen, Nutzungshinweise und tatsächliche Datenverarbeitung stehen vollständig in der Oberfläche. Original-PDFs werden vom Hersteller eingebettet/verlinkt, nicht lokal kopiert; keine freie Wiederverwendungslizenz behauptet.

## Numerik

Platte: implizite 2D-Finite-Volumen-Wärmeleitung über einen symmetrischen Viertelquerschnitt mit 20 × 20 Zellen und zwei frei wählbaren Kantenlängen. Beide äußeren Ränder geben Wärme ab; Ecken kühlen dadurch in zwei Richtungen. Lösung durch implizites Richtungssplitting erster Ordnung. Rundstab: 20 radiale Zellen, langer Stab ohne Stirnflächen. Konstante thermische Lehrwerte, Robin-Rand und Symmetrie im Kern. Konservative Wärmeflüsse; Volumenmittel bei Zylinder mit Ringgewichtung. Heuristische additive Umwandlungskinetik, Andrews/Hersteller-Ms, Koistinen–Marburger nur bei neuem Temperaturminimum. Sofortige Austenitisierung über oberer Modellgrenze +10 K. Anlassdosis und Härtemischung sind eigene illustrative Annahmen. Keine Rückkopplung der Umwandlungswärme.

## Prüfen

Node >=20: npm test. Für Vorschau über einen HTTP-Server öffnen, da Module/Worker beim direkten file-Aufruf nicht verfügbar sind. Die Tests prüfen Stoffanteil- und Wärmebilanzen, thermische Schranken, Geometrieeinfluss, Verfeinerung, Martensit ohne künstliche Haltezeitabhängigkeit, Referenzmodus und SVG-Export. Sie validieren nicht die Werkstoffprognose.

## Exporte

Alle sieben eigenen Grafiken: PNG und echte SVG-Vektoren mit identischer Zeichenroutine, Daten, Markierung, Zeit und gewähltem Zustand. CSV enthält alle gespeicherten Zeitpunkte/Orte und Modellhinweise; JSON enthält vollständige Parameter und Ergebniszustände. Downloads lokal. Keine Messdatenübertragung oder persistente Speicherung.

## ZTU-Darstellung

Gefüllte Bereiche mit Start-/Endgrenzen. TTT: 1/99 % der isolierten Reaktion. CCT: 1/99 % des bei 20 °C erreichten Endanteils je Bestandteil und Kühlrate; nur Bestandteile ab 1 % Endanteil. Diese Darstellung ist ausdrücklich kein 99-%-Gesamtgefüge-Kriterium. Drei äquivalente logarithmische Zeitachsen in s, min und h verwenden Zehnerpotenzen. Schwarz-Weiß-Auswahl gilt für alle lokalen Grafiken und ihre PNG-/SVG-Exporte; ZTU-Flächen erhalten Vektorschraffuren bzw. Punktmuster. Sechs separate Gefügeskizzen erklären idealisierte Morphologien ohne reale Kornberechnung.

## Zeitsteuerung
Bei aktivem Simulationsverlauf läuft die Zeitsteuerung am unteren Bildschirmrand mit. Derselbe Regler steuert alle Grafiken. Die vorhandenen Wiedergabe- und Positionsfunktionen sind auch beim Betrachten weiter unten liegender Diagramme erreichbar. Die Leiste passt sich Mobilgeräten an und lässt sich mit Tastatur und Touch bedienen.

## Prozess, Startbedingungen und räumliche Darstellung

Ein Klick auf „Prozess in ZTU übertragen“ berechnet die Thermalhistorie an Kern, Flächenmitte und Ecke und zeigt die passende erste Abkühlung (CCT) oder Badhaltephase (TTT) mit korrektem Zeitnullpunkt. Anlasshaltezeiten werden nicht als isothermer Austenitzerfall eingeordnet. Der Gesamtprozess ist zusätzlich als ausdrücklich gekennzeichnete Orientierung darstellbar. Zeitmarker und bestehende mitlaufende Zeitsteuerung bleiben synchron.

ZTU-Startbedingungen aus Prozess, Werkstoffpreset, freier Eingabe oder verfügbarer Herstellerreferenz wählbar. Das Lehrmodell verändert bei anderer Starttemperatur den CCT-Integrationsstart, modelliert jedoch keine austenitisierungsabhängige Korngröße/Karbidauflösung; TTT-Kinetik bleibt gleich. Referenz-PDFs werden nicht künstlich an andere Temperaturen angepasst. Ac1/Ac3 beziehungsweise Acm werden als Referenz oder Näherung beschriftet; unbekannte Werte für hochlegierte Sorten werden nicht erfunden.

Die Farbkarte mischt Gefügefarben nach lokalen Anteilen und interpoliert räumlich zwischen Zellwerten. Einzelbestandteile sind als Prozentansicht wählbar. Eine höhenverstellbare horizontale Schnittlinie verbindet Ortsprofil und Punktablesung. CSV/JSON enthalten beide Koordinaten.

## Prüfung der 2D-Erweiterung

Zusätzliche Tests prüfen schnellere Ecken gegenüber Flächenmitten, Einfluss der zweiten Kantenlänge, Symmetrie, räumliche/zeitliche Verfeinerung, Grenzfall der unendlich ausgedehnten Platte, Volumenmittel und Phasensummen bei der Interpolation. Die zeitliche Pfadzuordnung trennt Anlasshaltezeiten von isothermem Austenitzerfall. Mobile Orts- und Zeitsteuerung sowie Diagrammdialoge wurden im Browser geprüft.

## Fachtheorie und einheitliche Bedienung
[Fachtheorie öffnen](https://werkzeugdeck.pages.dev/bereiche/werkstofftechnik/theorie/) · [Design- und Exportvorgaben](https://github.com/FalkBornmann/Werkzeugdeck/blob/main/docs/DESIGN.md)
Das gemeinsame Exportmenü bietet Darstellung, Dateityp und Speichern. PNG ist vorausgewählt; SVG enthält skalierbare Vektoren und Text.
Zeitabhängige Darstellungen können zusätzlich als lokales Video (WebM beziehungsweise MP4 nach Browserunterstützung) gespeichert werden. Die Filmlänge ist wählbar. Eingaben werden während der Aufnahme gesperrt; Abbrechen und Abschluss stellen den vorherigen Zeitpunkt wieder her.
