# Generoitavat kuvat

Tämä tiedosto luodaan komennolla `npm run generoitavat`. Siinä on vain se mitä
vielä puuttuu, joten lista lyhenee itsestään kun pudotat kuvia kansioihin.

**Kaikki kuvat ovat paikallaan.**

Yhteiset säännöt:

- Nimet täsmälleen kuten alla. Välilyönnit ja alaviivat ovat sallittuja, eri sanat eivät.
- Valokuvat `.jpg`, piirrokset `.svg`. **Ei .heic**, muunna iPhonen kuvat ensin.
- Koko ei haittaa, kuvat pakataan automaattisesti ennen julkaisua.
- Tarkista lopuksi `npm run check-assets`, tai lue raportti GitHubin Actions-sivulta.

## Mitä ei kannata generoida

**Käyttöliittymän ikonit.** Ne on piirretty koodissa (`components/ui/Icons.tsx`),
40 kappaletta, joista 16 on kategoriaikoneita. Ne perivät värin ympäristöstään,
skaalautuvat mihin kokoon tahansa ja painavat nolla kilotavua. Kuvatiedostoina ne
menettäisivät kaikki kolme. Jos haluat oman tyylin, anna yksi mallikuva, niin ne
piirretään uudelleen koodiin sen mukaan.
