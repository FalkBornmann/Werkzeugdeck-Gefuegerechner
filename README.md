# Gefügerechner für Stähle

Werkzeugdeck / Werkstofftechnik / Simulation. Statische Browseranwendung, keine Laufzeitabhängigkeiten; Berechnung in einem lokalen Modul-Worker.

Workflow: Werkstoffgruppe und Stahl auswählen → sofort TTT/CCT-Modellkurven bzw. verfügbare Herstellerreferenz ansehen → Prozesspreset bearbeiten → Platte oder langen Rundstab berechnen → Zeit, Ort und Ansicht wählen → lokal exportieren.

## Datenlage

Die Kinetik ist ein **unkalibriertes Lehrmodell**, kein validierter Prozessauslegungsrechner. Herstellerlinks machen die Modellkurven nicht zu Messdaten. Modellstahl: 0,02–2,00 Massen-% C; Kinetik nur bis 0,80 %. C45, 42CrMo4 und 16MnCr5 verwenden repräsentative Analysen. Hochlegierte Werkzeugstähle K110/D2, W302/H13 und S600/M2 bleiben im Referenzmodus mit Temperaturrechnung. Kein Aufkohlen, keine Karbidkinetik, Sekundärhärtung oder NE-Legierungen.

Quellen, Modellgleichungen, Koeffizienten, Werkstoffbedingungen, Nutzungshinweise und tatsächliche Datenverarbeitung stehen vollständig in der Oberfläche. Original-PDFs werden vom Hersteller eingebettet/verlinkt, nicht lokal kopiert; keine freie Wiederverwendungslizenz behauptet.

## Numerik

Implizite 1D-Finite-Volumen-Wärmeleitung, 32 Zellen über halbe Plattendicke oder Radius. Konstante thermische Lehrwerte, Robin-Rand und Symmetrie im Kern. Konservative Wärmeflüsse; Volumenmittel bei Zylinder mit Ringgewichtung. Heuristische additive Umwandlungskinetik, Andrews/Hersteller-Ms, Koistinen–Marburger nur bei neuem Temperaturminimum. Sofortige Austenitisierung über oberer Modellgrenze +10 K. Anlassdosis und Härtemischung sind eigene illustrative Annahmen. Keine Rückkopplung der Umwandlungswärme.

## Prüfen

Node >=20: npm test. Für Vorschau über einen HTTP-Server öffnen, da Module/Worker beim direkten file-Aufruf nicht verfügbar sind. Die Tests prüfen Stoffanteil- und Wärmebilanzen, thermische Schranken, Geometrieeinfluss, Verfeinerung, Martensit ohne künstliche Haltezeitabhängigkeit, Referenzmodus und SVG-Export. Sie validieren nicht die Werkstoffprognose.

## Exporte

Alle sechs eigenen Grafiken: PNG und echte SVG-Vektoren mit identischer Zeichenroutine, Daten, Markierung, Zeit und gewähltem Zustand. CSV enthält alle gespeicherten Zeitpunkte/Orte und Modellhinweise; JSON enthält vollständige Parameter und Ergebniszustände. Downloads lokal. Keine Messdatenübertragung oder persistente Speicherung.
