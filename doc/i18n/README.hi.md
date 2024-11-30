<h3 align="center"><img width="80" alt="Puter.com, व्यक्तिगत क्लाउड कंप्यूटर: आपकी सभी फाइलें, ऐप्स और गेम एक ही स्थान पर, कभी भी, कहीं से भी पहुँच योग्य." src="https://assets.puter.site/puter-logo.png"></h3>

<h3 align="center">इंटरनेट ऑपरेटिंग सिस्टम! मुफ़्त, ओपन-सोर्स, और स्वयं-होस्ट करने योग्य|</h3>

<p align="center">
    <img alt="GitHub repo size" src="https://img.shields.io/github/repo-size/HeyPuter/puter"> <img alt="GitHub Release" src="https://img.shields.io/github/v/release/HeyPuter/puter?label=latest%20version"> <img alt="GitHub License" src="https://img.shields.io/github/license/HeyPuter/puter">
</p>
<p align="center">
    <a href="https://puter.com/"><strong>« LIVE DEMO »</strong></a>
    <br />
    <br />
    <a href="https://puter.com">Puter.com</a>
    ·
    <a href="https://docs.puter.com" target="_blank">SDK</a>
    ·
    <a href="https://discord.com/invite/PQcx7Teh8u">Discord</a>
    ·
    <a href="https://www.youtube.com/@EricsPuterVideos">YouTube</a>
    ·
    <a href="https://reddit.com/r/puter">Reddit</a>
    ·
    <a href="https://twitter.com/HeyPuter">X (Twitter)</a>
    ·
    <a href="https://hackerone.com/puter_h1b">Bug Bounty</a>
</p>

<h3 align="center"><img width="800" style="border-radius:5px;" alt="screenshot" src="https://assets.puter.site/puter.com-screenshot-3.webp"></h3>

<br/>

## Puter

Puter एक उन्नत, ओपन-सोर्स इंटरनेट ऑपरेटिंग सिस्टम है जिसे फीचर-रिच, असाधारण रूप से तेज़ और अत्यधिक विस्तार योग्य बनाने के लिए डिज़ाइन किया गया है। Puter का उपयोग इस प्रकार किया जा सकता है:

-  एक गोपनीयता-पहले व्यक्तिगत क्लाउड जो आपकी सभी फ़ाइलों, ऐप्स और गेम को एक सुरक्षित स्थान पर रखता है, जिसे कहीं से भी किसी भी समय एक्सेस किया जा सकता है।
- वेबसाइट, वेब ऐप्स और गेम बनाने और प्रकाशित करने के लिए एक प्लेटफ़ॉर्म।
- ड्रॉपबॉक्स, Google ड्राइव, OneDrive आदि का एक विकल्प नए इंटरफ़ेस और शक्तिशाली सुविधाओं के साथ सर्वर और वर्कस्टेशन के लिए एक रिमोट डेस्कटॉप वातावरण।
- वेब विकास, क्लाउड कंप्यूटिंग, वितरित सिस्टम और बहुत कुछ सीखने के लिए एक दोस्ताना, ओपन-सोर्स प्रोजेक्ट और समुदाय!

<br/>

## शुरू करें


### 💻 स्थानीय विकास

```bash
git clone https://github.com/HeyPuter/puter
cd puter
npm install
npm start
```

यह Puter को लॉन्च करेगा http://puter.localhost:4100 (या अगले उपलब्ध पोर्ट पर).

<br/>

### 🐳 डॉकर


```bash
mkdir puter && cd puter && mkdir -p puter/config puter/data && sudo chown -R 1000:1000 puter && docker run --rm -p 4100:4100 -v `pwd`/puter/config:/etc/puter -v `pwd`/puter/data:/var/puter  ghcr.io/heyputer/puter
```

<br/>


### 🐙 डॉकर कंपोज़


#### लिनक्स/मैकओएस
```bash
mkdir -p puter/config puter/data
sudo chown -R 1000:1000 puter
wget https://raw.githubusercontent.com/HeyPuter/puter/main/docker-compose.yml
docker compose up
```
<br/>

#### विंडोज


```powershell
mkdir -p puter
cd puter
New-Item -Path "puter\config" -ItemType Directory -Force
New-Item -Path "puter\data" -ItemType Directory -Force
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/HeyPuter/puter/main/docker-compose.yml" -OutFile "docker-compose.yml"
docker compose up
```
<br/>

### ☁️ Puter.com

Puter एक होस्टेड सेवा के रूप में उपलब्ध है [**puter.com**](https://puter.com).

<br/>

## सिस्टम आवश्यकताएँ

- **ऑपरेटिंग सिस्टम:** लिनक्स, मैकओएस, विंडोज
- **रैम:** 2GB न्यूनतम (4GB अनुशंसित)
- **डिस्क स्थान:** 1GB खाली स्थान
- **नोड.जेएस:** संस्करण 16+ (संस्करण 22+ अनुशंसित)
- **एनपीएम:** नवीनतम स्थिर संस्करण

<br/>

## समर्थन

मेनटेनरों और समुदाय से इन चैनलों के माध्यम से जुड़ें:

- बग रिपोर्ट या फीचर रिक्वेस्ट? कृपया [open an issue](https://github.com/HeyPuter/puter/issues/new/choose).
- डिस्कॉर्ड: [discord.com/invite/PQcx7Teh8u](https://discord.com/invite/PQcx7Teh8u)
- X (ट्विटर): [x.com/HeyPuter](https://x.com/HeyPuter)
- रेड्डिट: [reddit.com/r/puter/](https://www.reddit.com/r/puter/)
- मास्टोडॉन: [mastodon.social/@puter](https://mastodon.social/@puter)
- सुरक्षा समस्याएँ? [security@puter.com](mailto:security@puter.com)
- ईमेल रखरखावकर्ता को [hi@puter.com](mailto:hi@puter.com)

हमें आपकी किसी भी प्रश्न में मदद करने में खुशी होगी। बेझिझक पूछें!

<br/>


##  लाइसेंस

यह रिपॉजिटरी, इसकी सभी सामग्री, उप-प्रोजेक्ट्स, मॉड्यूल और घटकों सहित, लाइसेंस के तहत है [AGPL-3.0](https://github.com/HeyPuter/puter/blob/main/LICENSE.txt) जब तक स्पष्ट रूप से अन्यथा नहीं कहा गया है। इस रिपॉजिटरी में शामिल तृतीय-पक्ष पुस्तकालयों के अपने स्वयं के लाइसेंस के अधीन हो सकते हैं।

<br/>
