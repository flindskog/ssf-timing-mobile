# SSF Timing Mobile

En mobilsida för att visa liveresultat som [SSF Timing](http://www.skidor.com/sv/SvenskaSkidforbundet/Tavlingsadministration/SSFTiming/) publicerar. Sidan är gjord för att det lätt ska gå att läsa liveresultaten på mobiltelefoner, vilket inte direkt är fallet med den sidan som programmet genererar.

## Installation
### Krav
* [Maven](http://maven.apache.org) måste vara installerat.

### Bygg
<pre>> mvn package</pre>

### Installation
* Kopiera filerna i <code>target/ssf-mobile-timing-[version]-default</code> till webbsajten där 
resultaten publiceras

## Versionshistorik
* 0.2.0 (2013-01-20) - Bröt ut teman. Befintliga: DIF Alpin & Default.
* 0.1.0 (2012-03-14) - Första versionen, DIF Alpin

## Framtida förbättringsförslag
* Visa tider för åk 1 och åk 2 vid visning av totalresultaten. Nu visas bara totaltiden.