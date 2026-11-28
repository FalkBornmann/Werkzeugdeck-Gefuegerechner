> **Archiv seit 28. November 2026.** Die aktuelle Entwicklung liegt im gemeinsamen Repository [FalkBornmann/Werkzeugdeck](https://github.com/FalkBornmann/Werkzeugdeck/tree/main/Werkstofftechnik/Simulation/Gefuegerechner). Dieses Repository erhält die frühere Historie. Neue Änderungen und weitere Tools ausschließlich im gemeinsamen Repository pflegen. [Onlinewerkzeug öffnen](https://werkzeugdeck.pages.dev/tools/gefuegerechner/).

# Gefügerechner für Stähle

Werkzeugdeck / Werkstofftechnik / Simulation. Statische Browseranwendung, keine Laufzeitabhängigkeiten; Berechnung in einem lokalen Modul-Worker.

Workflow: Werkstoffgruppe und Stahl auswählen → sofort TTT/CCT-Modellkurven bzw. verfügbare Herstellerreferenz ansehen → Prozesspreset bearbeiten → Platte oder langen Rundstab berechnen → Zeit, Ort und Ansicht wählen → lokal exportieren.

## Datenlage

Die Kinetik ist ein **unkalibriertes Lehrmodell**, kein validierter Prozessauslegungsrechner. Herstellerlinks machen die Modellkurven nicht zu Messdaten. Modellstahl: 0,02–2,00 Massen-% C; Kinetik einschließlich übereutektoider Fe–C-Modellstähle bis 2,00 %; dort besonders unsichere Lehrprognosen. C45, 42CrMo4 und 16MnCr5 verwenden repräsentative Analysen. Hochlegierte Werkzeugstähle K110/D2, W302/H13 und S600/M2 bleiben im Referenzmodus mit Temperaturrechnung. Kein Aufkohlen, keine allgemeine Karbidkinetik oder Sekundärhärtung oder NE-Legierungen.

Quellen, Modellgleichungen, Koeffizienten, Werkstoffbedingungen, Nutzungshinweise und tatsächliche Datenverarbeitung stehen vollständig in der Oberfläche. Original-PDFs werden vom Hersteller eingebettet/verlinkt, nicht lokal kopiert; keine freie Wiederverwendungslizenz behauptet.

## Numerik

Platte: implizite 2D-Finite-Volumen-Wärmeleitung über einen symmetrischen Viertelquerschnitt mit 20 × 20 Zellen und zwei frei wählbaren Kantenlängen. Beide äußeren Ränder geben Wärme ab; Ecken kühlen dadurch in zwei Richtungen. Lösung durch implizites Richtungssplitting erster Ordnung. Rundstab: 20 radiale Zellen, langer Stab ohne Stirnflächen. Konstante Referenzwerte oder temperaturabhängige Lehrprofile, Robin-Rand und Symmetrie im Kern. Konservative Wärmeflüsse; Volumenmittel bei Zylinder mit Ringgewichtung. Heuristische additive Umwandlungskinetik, Andrews/Hersteller-Ms, Koistinen–Marburger nur bei neuem Temperaturminimum. Zeitabhängige Teil-/Voll-Austenitisierung über eigene ZTA-Zeitkonstanten. Anlassdosis und Härtemischung sind eigene illustrative Annahmen. Optionale explizite Rückkopplung der Umwandlungswärme als Sensitivitätsmodus.

## Prüfen

Node >=20: npm test. Für Vorschau über einen HTTP-Server öffnen, da Module/Worker beim direkten file-Aufruf nicht verfügbar sind. Die Tests prüfen Stoffanteil- und Wärmebilanzen, thermische Schranken, Geometrieeinfluss, Verfeinerung, Martensit ohne künstliche Haltezeitabhängigkeit, Referenzmodus und SVG-Export. Sie validieren nicht die Werkstoffprognose.

## Exporte

Alle sieben eigenen Grafiken: PNG und echte SVG-Vektoren mit identischer Zeichenroutine, Daten, Markierung, Zeit und gewähltem Zustand. CSV enthält alle gespeicherten Zeitpunkte/Orte und Modellhinweise; JSON enthält vollständige Parameter und Ergebniszustände. Downloads lokal. Keine Messdatenübertragung oder persistente Speicherung.

## ZTU-Darstellung

Gefüllte Bereiche mit Start-/Endgrenzen. TTT: 1/99 % der isolierten Reaktion. CCT: 1/99 % des bei 20 °C erreichten Endanteils je Bestandteil und Kühlrate; nur Bestandteile ab 1 % Endanteil. Diese Darstellung ist ausdrücklich kein 99-%-Gesamtgefüge-Kriterium. Drei äquivalente logarithmische Zeitachsen in s, min und h verwenden Zehnerpotenzen. Schwarz-Weiß-Auswahl gilt für alle lokalen Grafiken und ihre PNG-/SVG-Exporte; ZTU-Flächen erhalten Vektorschraffuren bzw. Punktmuster. Neun separate Gefügeskizzen erklären idealisierte Morphologien ohne reale Kornberechnung.

## Zeitsteuerung
Bei aktivem Simulationsverlauf läuft die Zeitsteuerung am unteren Bildschirmrand mit. Derselbe Regler steuert alle Grafiken. Die vorhandenen Wiedergabe- und Positionsfunktionen sind auch beim Betrachten weiter unten liegender Diagramme erreichbar. Die Leiste passt sich Mobilgeräten an und lässt sich mit Tastatur und Touch bedienen.

## Prozess, Startbedingungen und räumliche Darstellung

Ein Klick auf „Prozess in ZTU übertragen“ berechnet die Thermalhistorie an Kern, Flächenmitte und Ecke und zeigt die passende erste Abkühlung (CCT) oder Badhaltephase (TTT) mit korrektem Zeitnullpunkt. Anlasshaltezeiten werden nicht als isothermer Austenitzerfall eingeordnet. Der Gesamtprozess ist zusätzlich als ausdrücklich gekennzeichnete Orientierung darstellbar. Zeitmarker und bestehende mitlaufende Zeitsteuerung bleiben synchron.

ZTU-Startbedingungen aus Prozess, Werkstoffpreset, freier Eingabe oder verfügbarer Herstellerreferenz wählbar. Das Lehrmodell verändert bei anderer Starttemperatur den CCT-Integrationsstart, berücksichtigt angenommene Homogenisierung und einen dimensionslosen Kornindex. Übereutektoide Fe–C-Modellstähle besitzen zusätzlich eine eigene, unkalibrierte Karbidauflösung; keine physikalische Korngröße wird vorhergesagt. Referenz-PDFs werden nicht künstlich an andere Temperaturen angepasst. Ac1/Ac3 beziehungsweise Acm werden als Referenz oder Näherung beschriftet; unbekannte Werte für hochlegierte Sorten werden nicht erfunden.

Die Farbkarte mischt Gefügefarben nach lokalen Anteilen und interpoliert räumlich zwischen Zellwerten. Einzelbestandteile sind als Prozentansicht wählbar. Eine höhenverstellbare horizontale Schnittlinie verbindet Ortsprofil und Punktablesung. CSV/JSON enthalten beide Koordinaten.

## Prüfung der 2D-Erweiterung

Zusätzliche Tests prüfen schnellere Ecken gegenüber Flächenmitten, Einfluss der zweiten Kantenlänge, Symmetrie, räumliche/zeitliche Verfeinerung, Grenzfall der unendlich ausgedehnten Platte, Volumenmittel und Phasensummen bei der Interpolation. Die zeitliche Pfadzuordnung trennt Anlasshaltezeiten von isothermem Austenitzerfall. Mobile Orts- und Zeitsteuerung sowie Diagrammdialoge wurden im Browser geprüft.

## Fachtheorie und einheitliche Bedienung
[Fachtheorie öffnen](https://werkzeugdeck.pages.dev/bereiche/werkstofftechnik/theorie/) · [Design- und Exportvorgaben](https://github.com/Werkzeugdeck/website/blob/main/docs/DESIGN.md)
Das gemeinsame Exportmenü bietet Darstellung, Dateityp und Speichern. PNG ist vorausgewählt; SVG enthält skalierbare Vektoren und Text.
Zeitabhängige Darstellungen können zusätzlich als lokales Video (WebM beziehungsweise MP4 nach Browserunterstützung) gespeichert werden. Die Filmlänge ist wählbar. Eingaben werden während der Aufnahme gesperrt; Abbrechen und Abschluss stellen den vorherigen Zeitpunkt wieder her.

## Modellüberarbeitung 21. November 2026

Feste Konvention in reference.js (727 °C / 0,76 % C / Ferrit 0,022 % / Zementit 6,67 %), getrennt von unveränderten Herstellerreferenzen. Zeitabhängige Austenitisierung, qualitative Homogenisierung/Kornindex, getrennte Ferritkinetik und konservative Kohlenstoffreservoirs in metallurgy.js. Neue Martensitbeiträge erben keine Anlassdosis; ein exponentielles Härtemoment verfolgt unterschiedliche Bildungszeiten. Die gradeabhängigen Arrhenius-Parameter sind ausdrücklich unkalibriert.

Morphologie: grober/feiner Perlit, oberer/unterer Bainit und subkritische Einformung als Lehrindizes; eigene Vektorskizzen und lokale Bestands-/Phasenaufschlüsselung. Der P-Sammelbestand umfasst auch eingeformtes Ferrit–Zementit-Gefüge. B/TM werden mangels Karbiddaten nicht in scheinbar exakte Phasenmengen zerlegt.

Thermisch: konstante Basis oder normierte k(T)/cp(T)-Sensitivitätsprofile. Medienauswahl pro Schritt mit eigenen Öl-/Wasser-h(T)-Lehrprofilen. Umwandlungswärme ±80 kJ/kg als separater, standardmäßig ausgeschalteter expliziter Sensitivitätsmodus. Stoffdaten- und Quellschritt sind nicht experimentell validiert.

reference-cases.js enthält unveränderliche, belegte Produktbereiche von Ovako für C45/42CrMo4 samt fehlenden Metadaten und einer Kalibrierfähigkeitssperre. Es gibt weiterhin KEINEN vollständigen experimentellen Prozess-/Gefügereferenzfall. Keine Anpassung oder unabhängige Validierung behaupten. HB und HV nicht gleichsetzen. Messdaten für ZTA, Anlasskurven, Sekundärhärtung und Medien fehlen weiterhin. Jominy wurde nicht erweitert.

JSON-Schema 3 enthält Referenzversion, Modelloptionen, lokale Kohlenstoffreservoirs und Historienindizes; CSV enthält C-Bilanz und Historiendaten. Alle Grafiken inklusive lokaler Bestandsansicht bieten lokale PNG-/Vektor-SVG-Ausgabe über das gemeinsame Exportmenü, dynamische Ansichten zusätzlich Video.

## Ortsfeste Gefügeprojektion und Lupe

Drei räumliche Ansichten: nur Farbmischung, neutrale Gefügeskizze ohne Farbunterlegung oder Kombination. texture-render.js erzeugt ein deterministisches synthetisches Voronoi-Muster mit weich überblendeter, anteilsabhängiger Zuordnung. Die Lupe vergrößert denselben Musterraum. Direkte Punktwahl per Maus/Touch und Pfeiltasten sowie vorhandene Ortsregler bleiben synchron. Numerische Punktwerte werden für alle Anzeigen bilinear beziehungsweise radial interpoliert. Optionaler Kern-/Flächen-/Eckvergleich, beim Rundstab Kern/Mantel. Alle neuen Grafiken besitzen PNG-/Vektor-SVG- und Videoexport; Gesamtansicht ist die PNG-Voreinstellung. JSON-Schema 4 enthält Ansichtsmodus, Vorzeichen/Polarwinkel, Vergrößerung und Vergleichsauswahl. Rechenmodell und Referenzwerte wurden dafür nicht geändert. Die Zeichnung ist keine Vorhersage realer Körner; ihr Flächenanteil ist keine zusätzliche quantitative Auswertung.

Desktop: Werkstoff- und Geometrie-Seitenleiste ab 1051 px sticky, eigene Bildlaufleiste bei Überhöhe und Höhenreserve für die Zeitsteuerung. Musterfeinheit 0,5×–5× unabhängig von der Lupenvergrößerung, im JSON-Darstellungszustand und allen Bild-/Videoansichten enthalten. Das Muster besitzt einen auflösungsabhängigen Cache; geometrisch sicher ausgeschlossene Fernnachbarn sparen Voronoi-Clips. Modellgitter, Werkstoffdaten und Prognosewerte bleiben unverändert.

Der Werkstückquerschnitt nutzt die volle Kartenbreite mit größerer Beschriftung. Die Lupe steht darunter. Beide Darstellungsregler reichen bis 5×; stärkere Feinheit erhöht nur die Zeichendichte.

## Übereutektoider Fe–C-Modellstahl · 22. November 2026

Bei mehr als 0,76 % C (feste Modellkonvention; oft auf 0,8 % gerundet) kann beim Abkühlen aus Austenit proeutektoider Zementit Fe₃C ausscheiden, bevorzugt an ehemaligen Austenitkorngrenzen. Das ist eine Karbidausscheidung, keine bloße atomare Kohlenstoffanreicherung. Bei 1,00 % C ergeben sich im langsamen Gleichgewichtsgrenzfall etwa 4,1 Massen-% proeutektoider Zementit und 95,9 % Perlit; dessen lamellarer Zementit kommt zusätzlich hinzu. Abschrecken kann diese Ausscheidung unterdrücken.

Eigene Zementit-Vorreaktion mit separat verfolgtem Kohlenstoff und illustrativem Grenzsaum-Bestand; zeitabhängige Auflösung erhaltener Karbide beim Austenitisieren. Der Saumbestand ist eine Modellmassenfraktion, keine vermessene Grenzflächenbelegung oder Filmdicke. Die Zeitkonstanten sind eigene unkalibrierte Annahmen, vollständig in der Fachtheorie der Oberfläche angegeben. Vogric et al. (2022), DOI 10.1007/s11661-022-06784-1, begründet die Mechanismen und Grenzen; sein SFFK-/Ledge-Modell ist hier nicht implementiert. Die lineare Acm-/Löslichkeitsnäherung bleibt ausdrücklich von bewerteter Thermodynamik getrennt.

Separate TTT-/CCT-Zementitflächen inklusive neutraler Druckmuster, neue schematische Karte, Partikel versus illustrative ehemalige Austenitgrenzen im Werkstück und in denselben Lupen. Musterfeinheit bleibt rein grafisch. Hochlegierte Referenzstähle bleiben ohne quantitative Kinetik; Härte/Rm bleiben oberhalb 0,65 % C gesperrt. JSON-Schema 5 enthält Kinetikversion und lokale Reservoirs einschließlich boundaryK, CSV zusätzlich Cγ und Grenzsaum-Bestand. Unabhängige experimentelle Validierung fehlt weiterhin.
