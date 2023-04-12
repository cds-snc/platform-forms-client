# Service-level agreement

Version 2

GC Forms is a cloud-based service that is owned and operated by the Canadian Digital Service (CDS) at the Treasury Board of Canada Secretariat (TBS). This service enables Canadian federal departments and agencies to create and publish forms, which are hosted by CDS. 

## Responsibilities

### The Canadian Digital Service (CDS) is responsible for:

- Hosting and supporting the GC Forms system.
- Handling support requests and inquiries during regular business hours (9am to 5pm Eastern Time). 
- Responding to API integration support within the [timelines provided](#service-response-time-and-contacts).
- Ensuring data transfer to the client via email is able to support Protected A data or meet the same security requirements as other email-based data delivery options.
- Patching security vulnerabilities in a timely manner, where CDS determines the level of threat a security vulnerability possesses. Major vulnerabilities are patched as soon as possible but no more than a week after the root cause is found. External dependencies for code are subject to longer timelines. Any infrastructure-level patching is the responsibility of [Amazon Web Services (AWS)](https://aws.amazon.com/service-terms/).
- Restoring the system to operation in case of any unplanned outages.
- Alerting clients if GC Forms is inaccessible for whatever reasons as soon as CDS learns of this. See our real-time [Status page](https://status-statut.cds-snc.ca/history/gc-forms-formulaires-gc).
- Ensuring the GC Forms system sends form responses to clients in a timely manner, as provided by [GC Notify](https://notification.canada.ca/service-level-agreement). 
- Ensuring the infrastructure providers do not disconnect the GC Forms or GC Notify system due to misuse by clients. 
- Ensuring the system is available for use, with page load time less than 10 seconds in Canada on high-speed Internet, unless the product is experiencing a denial of service attack or there are issues with AWS. 
- Limiting the rate at which end users can submit responses to preserve the security of CDS and client systems.
- Responding quickly to incidents. GC Forms follows the [TBS Directive on Security Management](https://www.tbs-sct.canada.ca/pol/doc-eng.aspx?id=32611) and follows an Incident Response process to resolve issues in a timely manner. 
- Sharing application logs with the Canadian Centre for Cyber Security (CCCS). GC Forms follows the [Direction on the Secure Use of Commercial Cloud Services: Security Policy Implementation Notice (SPIN)](https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/cloud-services/direction-secure-use-commercial-cloud-services-spin.html).

CDS can suspend a service at any time for anything deemed as inappropriate use. Notices of disconnect with a rationale will be provided when necessary. 

### GC Forms infrastructure providers are responsible for:

- Delivering emails with end-user data to the provided government email addresses.
- Providing AWS service cloud infrastructure.
- Enforcing the [AWS terms of service](https://aws.amazon.com/service-terms/).

CDS is not responsible for issues or outages with AWS infrastructure that may impact system uptime and availability. CDS is also not responsible for Amazon infrastructure failure, AWS, or Simple Email Service (SES). CDS is responsible for updating clients on any information pertaining to an AWS outage.

## Uptime guarantee

CDS guarantees that the GC Forms system shall have 99.0% uptime with no more than 1% downtime during regular business hours in a year.

CDS commits to a service availability rate of 99.0%—excluding urgent scheduled maintenance and planned maintenance periods (as defined herein)—for the hosted services across each calendar quarter in the contract period. This service-level agreement (SLA) covers infrastructure running the codebase and the database. 

Downtime is defined as an unplanned interruption to the service resulting in a user-perceptible reduction in the existing quality of service or an event that will impact the existing service to the customer.

GC Forms uses a continuous delivery approach, sometimes patching multiple times a day without any downtime. If we have to plan any downtime we will contact clients with a one week notice and try to ensure that planned downtime does not interfere with their operation of the system. 

This uptime guarantee excludes any downtime experienced by Amazon as they are our infrastructure provider. Amazon promises 99.9% uptime as per [their SLA](https://aws.amazon.com/messaging/sla/).

## Support

CDS provides reactive support services to monitor, track, and remedy issues raised by either its own internal monitoring tools or raised via client reporting channels.

### Service Availability

|Issue|Initial response|Ongoing updates|
|:-|:-|:-|
|Service is **unavailable**|8 hours, during regular business hours|Every two hours thereafter|
|Service is **affected** (performance issues, intermittent errors)|1 business day|1 per (business) day|
|Service is ***functioning** (e.g., data is being collected and received by client)|2 business days|2 business days|
  
### Service contacts and response time

All support requests should be directed to [Get support](https://forms-formulaires.alpha.canada.ca/en/form-builder/support). CDS will respond within eight hours of receiving your requests, Monday to Friday from 9am to 5pm (Eastern Time). Service tickets are logged in Freshdesk. They will be closed after 10 days, if there is no response from the client. 

|Description|Initial response|Resolution*|
|:-|:-|:-|
|New ticket created|1 business day|5 business days|
|Ticket with “Waiting on Customer” status|Not applicable|10 business days and will be closed if no further action is required|
|Service is affected (performance issues, intermittent errors)|1 business day|5 business days|
  
\* By resolution we mean: responding to client queries related to the interface or technical aspects of the product, such as feature requests (turning the service live, uploading a logo, etc.), addressing problems related to sign-in or account creation.

### Planned maintenance period 

A “planned maintenance period” shall be defined as a complete or partial loss of service availability scheduled by GC Forms to allow GC Forms to perform normal maintenance work. CDS shall notify the client of any planned maintenance period no fewer than 2 business days prior to the commencement of the applicable planned maintenance period. Planned maintenance periods shall be scheduled for non-peak periods of activity. 

A loss of service availability during a planned maintenance period shall not be considered a service outage. A loss of service availability, which occurs outside of a planned maintenance period but is caused by work performed during the planned maintenance period, shall be considered to be a service outage for the purpose of calculating GC Forms’s compliance with the provisions of service availability. Information regarding planned maintenance periods shall be shared by email. 

### Notice of service deprecation

In case CDS is no longer able to support and operate GC Forms or GC Notify due to factors beyond its control, it will notify clients 2 months in advance via email to the address associated with their GC Forms account. 

In the event that CDS needs to decommission the service, GC Forms will work with clients to ensure they have the data collected and still retained by the product, as well as provide an options analysis for alternative solutions. 

GC Forms is open source and available for others to stand up their own version based on the code found in [GitHub](https://github.com/cds-snc/platform-forms-client).
  
  

**Last update**: April 12, 2023