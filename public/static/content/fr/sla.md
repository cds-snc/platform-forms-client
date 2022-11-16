# Accord sur les niveaux de service de Formulaires GC 

Version 1.5

## Introduction

Formulaires GC est un service infonuagique créé et exploité par le Service numérique canadien (SNC) depuis mai 2021. Le présent accord définit les attentes de niveau de service de Formulaires GC pour les ministères et organismes du gouvernement fédéral. 

## Portée de l’accord

Cet accord concerne les responsabilités de différents groupes pour Formulaires GC : un système logiciel en tant que service (SaaS) hébergé sur Amazon Web Services (AWS). L’accord concerne la clientèle du système, définie comme des employé·e·s du gouvernement du Canada et les fournisseurs de services qui utilisent soit l’interface, soit l’API pour créer des formulaires et recevoir des réponses. Dans les deux cas, le SNC détient et héberge le service comme tel, et AWS est chargé de fournir les services d’infrastructure infonuagique.

## Responsabilités

### Le Service numérique canadien (SNC) est responsable :

1. d’héberger et de maintenir le système Formulaires GC.
- de répondre aux demandes de soutien et aux questions durant les heures normales de travail (de 9 h à 17 h, heure de l’Est).
- de répondre aux demandes de soutien liées à l’intégration API dans le respect des [délais fournis](#temps-de-reponse-du-service-et-mode-de-contact).
- de veiller à ce que le transfert de données à la clientèle par courriel puisse traiter des données Protégé A ou respecte les mêmes exigences en matière de sécurité que d’autres options de livraison de données par courriel.
- de veiller à ce que le transfert de données à la clientèle par le biais de l’API de récupération puisse traiter les données Protégé B au quatrième niveau de la détermination de menace.
- de corriger les vulnérabilités de sécurité en temps et lieu, là où le SNC est responsable d’évaluer le niveau de menace d’une vulnérabilité de sécurité. Les vulnérabilités majeures sont corrigées le plus tôt possible et au plus tard une semaine après la découverte de la cause racine. Les délais de traitement peuvent être plus longs pour les aspects qui dépendent de code externe. Tout correctif apporté à l’infrastructure est la responsabilité de AWS (Pour plus de renseignements, consultez les conditions de service de AWS : [https://aws.amazon.com/service-terms/](https://d1.awsstatic.com/legal/awsserviceterms/AWS_Service_Terms_French_\(2022-03-31\).pdf)).
- de rétablir le fonctionnement du système en cas d’une interruption imprévue du service.
- d’avertir la clientèle en cas d’inaccessibilité du système Formulaires GC, quelle que soit la raison, et ce, dès que le SNC en a connaissance. Pour suivre la disponibilité du service en temps réel, consultez la [page de statut pour les produits du SNC](https://status-statut.cds-snc.ca/).
- de veiller à ce que le système Formulaires GC envoie des réponses de formulaire rapidement à l’aide de Notification GC.
- de veiller à ce que les fournisseurs d’infrastructure ne déconnectent pas les systèmes Formulaires GC ou Notification GC en raison d’une utilisation abusive du service par la clientèle.
- de veiller à ce que le système fonctionne et à ce que le temps de chargement des pages soit inférieur à 10 secondes au Canada dans le cas d’une connexion Internet haute vitesse, à moins que le produit ne soit victime d’une attaque de déni de service ou qu’il y ait d’autres problèmes avec AWS.
- de limiter le rythme auquel les utilisateurs finaux et utilisatrices finales peuvent soumettre leurs réponses afin de préserver la sécurité des systèmes du SNC et de ceux de la clientèle.
- de répondre rapidement aux incidents : Formulaires GC respecte la [directive sur la gestion de la sécurité du SCT](https://www.tbs-sct.canada.ca/pol/doc-fra.aspx?id=32611) et dispose d’un processus d’intervention en cas d’incident afin de résoudre rapidement les problèmes.
- de partager les journaux de l’application avec le Centre canadien pour la cybersécurité : Formulaires GC respecte l’[Orientation sur l’utilisation sécurisée des services commerciaux d’informatique en nuage : Avis de mise en œuvre de la Politique sur la sécurité (AMOPS)](https://www.canada.ca/fr/gouvernement/systeme/gouvernement-numerique/innovations-gouvernementales-numeriques/services-informatique-nuage/orientation-utilisation-securisee-services-commerciaux-informatique-nuage-amops.html).

Le SNC peut suspendre le service pour une entité cliente ou pour un·e utilisateur·rice à tout moment en cas d’utilisation jugée inappropriée. Des avis de déconnexion justifiés seront fournis lorsque nécessaire.

### La clientèle a pour responsabilité :

1. de veiller à ce que les données recueillies n’excèdent pas le niveau de protection Protégé A.
- de veiller à disposer des autorisations nécessaires pour recueillir les renseignements personnels demandés dans le formulaire.
- de publier une traduction complète et exacte du formulaire et de l’avis de confidentialité.
- de veiller à ce que les approbations nécessaires pour l’utilisation de Formulaires GC aient été obtenues au sein du ministère ou de l’organisme client. La clientèle doit fournir au SNC les coordonnées des personnes ayant donné leur approbation. Le SNC utilise ces renseignements pour savoir avec qui communiquer en cas de modifications importantes du service ou de dissolution de ce dernier.
- de lire et respecter les conditions d’utilisation ([https://notification.canada.ca/conditions-dutilisation](https://notification.canada.ca/conditions-dutilisation)).
- d’éviter toute utilisation abusive du service, y compris son utilisation à des fins non convenues au préalable avec le SNC.
- de veiller à disposer de voies alternatives pour remplir le formulaire.
- de diriger la réponse aux requêtes liées à la _Loi sur l’accès à l’information et à la Loi sur la protection des renseignements personnels_ concernant les renseignements transmis par le biais de Formulaires GC et correspondant à un formulaire particulier, comme décrit dans la _Loi sur la gestion des finances publiques_ :
  - [**_Loi sur l’accès à l’information_**](https://laws-lois.justice.gc.ca/fra/lois/a-1/)  
  **(5)** Pour l’application de la [_Loi sur l’accès à l’information_](https://laws-lois.justice.gc.ca/fra/lois/a-1/), il est entendu que les documents de toute entité à qui le Conseil du Trésor fournit des services en vertu du paragraphe (4), qui, pour le compte de cette entité, sont conservés dans les systèmes de technologie de l’information du Conseil du Trésor ou transitent par ces systèmes ne relèvent pas du Conseil du Trésor.
  - [**_Loi sur la protection des renseignements personnels_**](https://laws-lois.justice.gc.ca/fra/lois/p-21/)  
  **(6)** Pour l’application de la [_Loi sur la protection des renseignements personnels_](https://laws-lois.justice.gc.ca/fra/lois/p-21/), il est entendu que les renseignements personnels qui sont recueillis par toute entité à qui le Conseil du Trésor fournit des services en vertu du paragraphe (4), qui, pour le compte de cette entité, sont conservés dans les systèmes de technologie de l’information du Conseil du Trésor ou transitent par ces systèmes ne relèvent pas du Conseil du Trésor.
- de fournir à Formulaires GC l’accès aux renseignements relatifs aux mesures de performance à des fins d’évaluation du système et des formulaires. Cela peut inclure :
  * les mesures des normes de service avant et après l’utilisation de Formulaires GC.
  * l’évaluation de la qualité de soumission des formulaires et les conséquences de cette dernière sur le flux de travail.
  * le taux d’utilisation/d’admission du programme avant et après l’utilisation de Formulaires GC.
- Lors du traitement de formulaires avec téléversement de documents **transmis par courriel**, de déterminer si un processus interne est nécessaire pour :
  * gérer tout document illégitime téléversé et soumis par les utilisateur·rice·s finaux·ales, comme du contenu pornographique ou dérangeant.
  * mettre en place des mesures d’analyse de contenu pour les soumissions avec téléversement de fichier afin de réduire le risque de virus ou de logiciel malveillant (p. ex. : détection de virus assurée par les services ministériels d’hébergement de courriels).
  * répondre aux conséquences opérationnelles ou aux conséquences sur le service du téléversement de documents par des utilisateur·rice·s finaux·ales en guise de soumission à des fins de pollupostage.
- Lors du traitement de formulaires par le biais de l’API de récupération de Formulaires GC :
  * de fournir à Formulaires GC les noms et adresses courriel de la ou des personne(s) responsable(s) de l’intégration de l’API au sein des systèmes de l’entité cliente.
  * de veiller à ce que les jetons du porteur et les jetons temporaires fournis à la clientèle soient conservés dans un environnement sûr, sur des appareils fournis par le gouvernement et sécurisés.
  * de veiller à ce que les jetons du porteur et les jetons temporaires soient transmis selon des méthodes chiffrées.
  * d’adapter les sorties de données (format JSON) aux spécifications applicables pour l’intégration aux systèmes de l’entité cliente.
  * de veiller à ce que l’intégration à l’API de récupération de Formulaires GC soit à jour, y compris, sans limitation, à ce que les jetons soient à jour, à ce que les soumissions de réponse soient reçues dans un format utilisable et à ce que les intergiciels soient à jour.
- Lors du traitement de formulaires par le biais de la partie protégée de Formulaires GC :
  * d’adhérer aux directives ministérielles concernant la bonne utilisation des appareils et des réseaux.
  * de s’assurer de ne jamais transmettre sa clé de sécurité à quiconque.
  * d’accuser réception des réponses au formulaire et en enregistrer une copie dans les 30 jours suivant la réception d’une réponse.
  * de signaler tout problème lié aux réponses enregistrées.
  * de traiter et d’enregistrer les réponses au formulaire conformément aux politiques de son organisme en matière de confidentialité et de conservation des données. La présente constitue votre copie officielle. Veuillez conserver une copie de toute réponse au formulaire pour vos dossiers.

### Les fournisseurs d’infrastructure de Formulaires GC sont responsables
1. d’envoyer des courriels comprenant les données des utilisateurs finaux et utilisatrices finales à l’adresse gouvernementale fournie ou aux adresses courriel gouvernementales fournies.
- de fournir l’infrastructure infonuagique d’AWS.
- de faire appliquer les conditions d’utilisation du service d’AWS. ([https://aws.amazon.com/service-terms/](https://d1.awsstatic.com/legal/awsserviceterms/AWS_Service_Terms_French_2022-10-14.pdf))

Le SNC n’est pas responsable des problèmes ou des interruptions de service de l’infrastructure AWS pouvant avoir des conséquences sur le temps de fonctionnement et la disponibilité du système. Le SNC n’est pas non plus responsable des défaillances de l’infrastructure d’Amazon, d’AWS ou de SES. Le SNC est tenu de transmettre à la clientèle toute information relative à une interruption du service AWS.

## Garantie sur le temps de fonctionnement

Le SNC garantit que chaque année, le système Formulaires GC fonctionnera 99 % du temps et ne sera pas immobilisé plus de 1 % du temps durant les heures normales d’ouverture.

Le SNC s’engage à maintenir un taux de disponibilité de 99 % pour les services hébergés – en dehors des maintenances d’urgence programmées et des périodes de maintenance planifiées (telles que définies dans la présente entente) – et ce, pour chaque trimestre de la durée du contrat. La présente entente sur les niveaux de service (ENS) vise l’infrastructure utilisant la base de code et la base de données.

Le temps d’arrêt correspond à une interruption imprévue du service entraînant une réduction perceptible de la qualité du service pour l’utilisateur·rice ou à un événement ayant des conséquences sur le service existant pour le ou la client·e.

Formulaires GC adopte une approche de livraison continue, aussi peut-il arriver que des corrections soient apportées au produit plusieurs fois par jour sans aucun temps d’arrêt. Si nous devons planifier une interruption de service, nous en informerons la clientèle une semaine à l’avance et tenterons de faire en sorte que le temps d’arrêt planifié n’interfère pas avec leur exploitation du système.

Cette garantie sur le temps de fonctionnement exclut toute immobilisation d’Amazon, notre fournisseur d’infrastructure. Amazon promet un taux de temps de fonctionnement de 99,9 %. ([https://aws.amazon.com/messaging/sla/](https://d1.awsstatic.com/legal/AmazonMessaging_SQS_SNS/Amazon%20Messaging%20\(SQS%2C%20SNS\)%20Service%20Level%20Agreement-April%202019_FR.pdf))

### Temps de réponse du service et mode de contact
Durant la phase alpha, toutes les demandes de soutien doivent être envoyées à [toassistance+forms@cds-snc.freshdesk.com](mailto:toassistance+forms@cds-snc.freshdesk.com). Le SNC répondra dans les huit heures suivant la réception de votre demande. L’assistance est uniquement disponible les jours ouvrables, de 9 h à 17 h.

Les tickets de service seront clôturés au bout de 10 jours si aucune réponse n’est reçue de la part de l’entité cliente.

## Aide

Le SNC offrira des services d’assistance réactifs afin de surveiller les problèmes, d’en faire un suivi et de les résoudre, que ces problèmes soient décelés par le biais de ses outils de veille ou exposés au moyen des canaux de signalement de la clientèle ayant fait l’objet d’une discussion et d’un accord entre le fournisseur et la clientèle.

Disponibilité du service

|Problème|Première intervention|Mises à jour continues|
|:-|:-|:-|
|Service indisponible|Huit heures, durant les heures normales d’ouverture|Toutes les deux heures par la suite|
|Service affecté (problèmes de performance, erreurs intermittentes)|Un jour ouvrable|Une par jour (ouvrable)|
|Service fonctionnel (données recueillies et reçues par la clientèle)|Deux jours ouvrables|Deux jours ouvrables|
  
Réponse du soutien technique

|Description|Première intervention|Résolution*|
|:-|:-|:-|
|Création d’un nouveau ticket dans FreshDesk|Un jour ouvrable|Cinq jours ouvrables|
|Ticket portant le statut « En attente d’action de la clientèle »|Non applicable|Dix jours ouvrables, puis clôture si aucune action supplémentaire n’est requise|
|Service affecté (problèmes de performance, erreurs intermittentes)|Un jour ouvrable|Cinq jours ouvrables|
  
\* Nous entendons par résolution : la réponse aux requêtes de la clientèle concernant les aspects techniques du produit ou les aspects liés à l’interface utilisateur, les demandes de fonctionnalités (lancement du service, téléversement du logo, augmentation de la limite quotidienne de messages) et traitement des problèmes liés à la connexion ou la création de compte.

### Période de maintenance planifiée
Une « période de maintenance planifiée » se définit comme une perte complète ou partielle de disponibilité du service que le fournisseur prévoit pour réaliser des travaux de maintenance. Le SNC notifiera la clientèle de toute période de maintenance planifiée au moins deux (2) jours ouvrables avant le début de la période en question. Les périodes de maintenance planifiées seront programmées pour survenir en dehors des périodes d’activité élevée.

Une perte de disponibilité du service durant une période de maintenance planifiée n’est pas considérée comme une interruption de service. Une perte de disponibilité du service survenant en dehors d’une période de maintenance planifiée mais causée par des travaux réalisés durant la période de maintenance planifiée est considérée comme une interruption de service aux fins de la détermination de la conformité du fournisseur aux termes de l’entente sur les niveaux de de service concernant la disponibilité du service. Les renseignements liés aux périodes de maintenance planifiée sont initialement fournis par courrier électronique.

### Avis de mise hors service
Si le SNC n’est plus en mesure d’offrir du soutien technique aux plateformes Formulaires GC et Notification GC et de les exploiter pour des raisons qui échappent à son contrôle, il en informera la clientèle deux mois à l’avance par un courriel envoyé au compte avec lequel la clientèle s’est inscrite à Formulaires GC.

Si le SNC doit mettre hors service Formulaires GC, il collaborera avec la clientèle pour veiller à ce que le produit continue de recueillir et de conserver les données et leur fournira une analyse des solutions alternatives.

Formulaires GC est un service à code source ouvert vous permettant de créer votre propre version. Il est basé sur le code disponible ici ([https://github.com/cds-snc/platform-forms-client](https://github.com/cds-snc/platform-forms-client))
  
  

**Dernière mise à jour **: 2022-10-11