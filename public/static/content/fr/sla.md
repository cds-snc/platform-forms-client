# Accord sur les niveaux de service 

Version 2

Formulaires GC est un service infonuagique créé et exploité par le Service numérique canadien (SNC) au sein du Secrétariat du Conseil du Trésor du Canada (SCT). Ce service permet aux ministères et organismes du gouvernement fédéral canadien de créer et de publier des formulaires hébergés par le SNC. 

## Responsabilités

### Le Service numérique canadien (SNC) est responsable :

- d’héberger et de maintenir le système Formulaires GC.
- de répondre aux demandes de soutien et aux questions durant les heures normales de travail (de 9 h à 17 h, heure de l’Est). 
- de répondre aux demandes de soutien liées à l’intégration API dans le respect des [délais fournis](#temps-de-reponse-du-service-et-mode-de-contact).
- de veiller à ce que le transfert de données à la clientèle par courriel puisse traiter des données Protégé A ou respecte les mêmes exigences en matière de sécurité que d’autres options de livraison de données par courriel.
- de corriger les vulnérabilités de sécurité en temps et lieu, là où le SNC est responsable d’évaluer le niveau de menace d’une vulnérabilité de sécurité; Les vulnérabilités majeures sont corrigées le plus tôt possible et au plus tard une semaine après la découverte de la cause racine. Les délais de traitement peuvent être plus longs pour les aspects qui dépendent de code externe. Tout correctif apporté à l’infrastructure est la responsabilité d’[Amazon Web Services (AWS)](https://d1.awsstatic.com/legal/awsserviceterms/AWS_Service_Terms_French_(2022-03-31).pdf).
- de rétablir le fonctionnement du système en cas d’une interruption imprévue du service.
- d’avertir la clientèle en cas d’inaccessibilité du système Formulaires GC, quelle que soit la raison, et ce, dès que le SNC en a connaissance. Consultez notre [page consacrée au statut en temps réel](https://status-statut.cds-snc.ca/history/gc-forms-formulaires-gc).
- de veiller à ce que le système Formulaires GC envoie rapidement des réponses de formulaire à la clientèle à l’aide de [Notification GC](https://notification.canada.ca/accord-niveaux-de-service). 
- de veiller à ce que les fournisseurs d’infrastructure ne déconnectent pas les systèmes Formulaires GC ou Notification GC en raison d’une utilisation abusive du service par la clientèle.
- de veiller à ce que le système fonctionne et à ce que le temps de chargement des pages soit inférieur à 10 secondes au Canada dans le cas d’une connexion Internet haute vitesse, à moins que le produit ne soit victime d’une attaque de déni de service ou qu’il y ait d’autres problèmes avec AWS. 
- de limiter le rythme auquel les utilisateurs finaux et utilisatrices finales peuvent soumettre leurs réponses afin de préserver la sécurité des systèmes du SNC et de ceux de la clientèle.
- de répondre rapidement aux incidents : Formulaires GC respecte la [directive sur la gestion de la sécurité du SCT](https://www.tbs-sct.canada.ca/pol/doc-fra.aspx?id=32611) et dispose d’un processus d’intervention en cas d’incident afin de résoudre rapidement les problèmes. 
- de partager les journaux de l’application avec le Centre canadien pour la cybersécurité (CCC) : Formulaires GC respecte l’[Orientation sur l’utilisation sécurisée des services commerciaux d’informatique en nuage : Avis de mise en œuvre de la Politique sur la sécurité (AMOPS)](https://www.canada.ca/fr/gouvernement/systeme/gouvernement-numerique/innovations-gouvernementales-numeriques/services-informatique-nuage/orientation-utilisation-securisee-services-commerciaux-informatique-nuage-amops.html).

Le SNC peut suspendre le service à tout moment en cas d’utilisation jugée inappropriée. Des avis de déconnexion justifiés seront fournis lorsque nécessaire. 

### Les fournisseurs d’infrastructure de Formulaires GC sont responsables :

- d’envoyer des courriels comprenant les données des utilisateurs finaux et utilisatrices finales aux adresses courriel gouvernementales fournies.
- de fournir l’infrastructure infonuagique d’AWS.
- de faire appliquer les [conditions de service d'AWS](https://d1.awsstatic.com/legal/awsserviceterms/AWS_Service_Terms_French_2022-10-14.pdf).

Le SNC n’est pas responsable des problèmes ou des interruptions de service de l’infrastructure AWS pouvant avoir des conséquences sur le temps de fonctionnement et la disponibilité du système. Le SNC n’est pas non plus responsable des défaillances de l’infrastructure d’Amazon, d’AWS ou d’Amazon Simple Email Service (SES). Le SNC est tenu de transmettre à la clientèle toute information relative à une interruption du service AWS.

## Garantie sur le temps de fonctionnement

Le SNC garantit que chaque année, le système Formulaires GC fonctionnera 99,0 % du temps et ne sera pas immobilisé plus de 1 % du temps durant les heures normales d’ouverture.

Le SNC s’engage à maintenir un taux de disponibilité de 99 % pour les services hébergés — en dehors des maintenances d’urgence programmées et des périodes de maintenance planifiées (telles que définies dans la présente entente) — et ce, pour chaque trimestre de la durée du contrat. La présente entente sur les niveaux de service (ENS) vise l’infrastructure utilisant la base de code et la base de données. 

Le temps d’arrêt correspond à une interruption imprévue du service entraînant une réduction perceptible de la qualité du service pour l’utilisateur·rice ou à un évènement ayant des conséquences sur le service existant pour le ou la client·e.

Formulaires GC adopte une approche de livraison continue, aussi peut-il arriver que des corrections soient apportées au produit plusieurs fois par jour sans aucun temps d’arrêt. Si nous devons planifier une interruption de service, nous en informerons la clientèle une semaine à l’avance et tenterons de faire en sorte que le temps d’arrêt planifié n’interfère pas avec leur exploitation du système. 

Cette garantie sur le temps de fonctionnement exclut toute immobilisation d’Amazon, notre fournisseur d’infrastructure. Amazon promet un taux de temps de fonctionnement de 99,9 % dans [son ENS](https://d1.awsstatic.com/legal/AmazonMessaging_SQS_SNS/Amazon%20Messaging%20\(SQS%2C%20SNS\)%20Service%20Level%20Agreement-April%202019_FR.pdf).

## Aide

Le SNC offrira des services d’assistance réactifs afin de surveiller les problèmes, d’en faire un suivi et de les résoudre, que ces problèmes soient décelés par le biais de ses outils de veille ou exposés au moyen des canaux de signalement par la clientèle.

### Disponibilité du service

|Problème|Première intervention|Mises à jour continues|
|:-|:-|:-|
|Service **indisponible**|Huit heures, durant les heures normales d’ouverture|Toutes les deux heures par la suite|
|Service **affecté** (problèmes de performance, erreurs intermittentes)|Un jour ouvrable|Une par jour (ouvrable)|
|Service **fonctionnel** (données recueillies et reçues par la clientèle)|Deux jours ouvrables|Deux jours ouvrables|
  
### Contacts relatifs au service et temps de réponse

Toutes les demandes d’assistance doivent être soumises sur notre page de [soutien](/fr/form-builder/support). Le SNC répondra aux demandes dans un délai de huit heures suivant la réception de ces dernières, et ce, du lundi au vendredi, de 9 h à 17 h (heure de l’Est). Les tickets de service sont consignés dans Freshdesk. Ils seront clôturés au bout de 10 jours si aucune réponse n’est reçue de la part de l’entité cliente. 

|Description|Première intervention|Résolution*|
|:-|:-|:-|
|Création d’un nouveau ticket|Un jour ouvrable|Cinq jours ouvrables|
|Ticket portant le statut « En attente d’action de la clientèle »|Non applicable|Dix jours ouvrables, puis clôture si aucune action supplémentaire n’est requise|
|Service affecté (problèmes de performance, erreurs intermittentes)|Un jour ouvrable|Cinq jours ouvrables|
  
\* Nous entendons par résolution : la réponse aux requêtes de la clientèle concernant les aspects techniques du produit ou les aspects liés à l’interface, les demandes de fonctionnalités (lancement du service, téléversement du logo, etc.) et traitement des problèmes liés à la connexion ou la création de compte.

### Période de maintenance planifiée

Une « période de maintenance planifiée » se définit comme une perte complète ou partielle de disponibilité du service que le fournisseur prévoit pour réaliser des travaux de maintenance. Le SNC notifiera la clientèle de toute période de maintenance planifiée au moins 2 jours ouvrables avant le début de la période en question. Les périodes de maintenance planifiées seront programmées pour survenir en dehors des périodes d’activité élevée. 

Une perte de disponibilité du service durant une période de maintenance planifiée n’est pas considérée comme une interruption de service. Une perte de disponibilité du service survenant en dehors d’une période de maintenance planifiée, mais causée par des travaux réalisés durant la période de maintenance planifiée est considérée comme une interruption de service aux fins de la détermination de la conformité de Formulaires GC aux termes relatifs à la disponibilité du service. Les renseignements liés aux périodes de maintenance planifiée sont communiqués par courriel. 

### Avis de mise hors service

Si le SNC n’est plus en mesure d’offrir du soutien technique aux plateformes Formulaires GC et Notification GC et de les exploiter pour des raisons qui échappent à son contrôle, il en informera la clientèle 2 mois à l’avance par un courriel envoyé à l’adresse associée à son compte Formulaires GC. 

Si le SNC doit mettre hors service Formulaires GC, il collaborera avec la clientèle pour veiller à ce que le produit continue de recueillir et de conserver les données et lui fournira une analyse des solutions alternatives. 

Formulaires GC est un produit à code source ouvert permettant à des tiers de créer leur propre version à l’aide du code disponible sur [GitHub](https://github.com/cds-snc/platform-forms-client).
  
  

**Dernière mise à jour **: 12 avril 2023