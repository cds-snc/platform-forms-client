# GC Forms Service-Level Agreement

Version 1.5

## Introduction

GC Forms is a cloud-based service that is owned and operated by the Canadian Digital Service (CDS) since May 2021. This agreement sets expectations of the level of service federal government departments and agencies receive.

## Scope

This agreement covers the responsibilities of different groups for GC Forms: a cloud-hosted Software as a Service (SaaS) system hosted on Amazon Web Services (AWS). This agreement includes clients of the system, defined as Government of Canada employees and service providers who use either the interface or API to build forms and receive responses where CDS is the provider and host of the service, and AWS is the cloud infrastructure provider.

## Responsibilities

### Canadian Digital Service (CDS) is responsible for:

1. Hosting and supporting the GC Forms system.
- Handling support requests and inquiries during regular business hours (9am - 5pm Eastern Time).
- Responding to API integration support within the [timelines provided](#service-response-time-and-contacts).
- Ensuring data transfer to the client via email is able to support Protected A data or meet the same security requirements as other email based data delivery options.
- Ensuring data transferred to the client via the retrieval API is able to support Protected B data at the Threat Determination level 4 (TD4).
- Patching security vulnerabilities in a timely manner, where CDS determines the level of threat a security vulnerability possesses. Major vulnerabilities are patched as soon as possible but no more than a week after the root cause is found. External dependencies for code are subject to longer timelines. Any infrastructure-level patching is the responsibility of AWS (For more information see their service terms: [https://aws.amazon.com/service-terms/](https://aws.amazon.com/service-terms/)).
- Restoring the system to operation in case of any unplanned outages.
- Alerting clients if GC Forms is to be inaccessible for whatever reasons as soon as CDS learns of this. To see real-time, see our [CDS Products status page](https://status-statut.cds-snc.ca/).
- Ensuring the GC Forms system sends form responses in a timely manner, as provided by GC Notify.
- Ensuring that the infrastructure providers don’t disconnect the GC Forms or GC Notify system due to misuse by clients.
- Ensuring the system is available for use, with page load time less than 10 seconds in Canada on high-speed Internet, unless the product is experiencing a denial of service attack or there are issues with AWS.
- Limiting the rate at which end-users can submit responses to preserve the security of CDS and client systems.
- Responding quickly to incidents. GC Forms follows the [TBS Directive on Security Management](https://www.tbs-sct.canada.ca/pol/doc-eng.aspx?id=32611) and follows an Incident Response process to resolve issues in a timely manner.
- Sharing application logs with the Canadian Centre for Cyber Security. GC Forms follows the [Direction on the Secure Use of Commercial Cloud Services: Security Policy Implementation Notice (SPIN)](https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/cloud-services/direction-secure-use-commercial-cloud-services-spin.html).

CDS can suspend a client or user’s service at any time for anything deemed as inappropriate use. Notices of disconnect with a rationale will be provided when necessary.

### Clients are responsible for:

1. Ensuring that the data being collected is up to protected A only.
- Ensuring that they have the appropriate authorities to collect the personal information requested in the form.
- Publishing a complete and accurate translation of the form and privacy notice.
- Ensuring that the appropriate approvals for usage of GC Forms have been obtained within the client department, agency, or organization. Clients must provide CDS with the contact information for these approvers. CDS uses this information to know with whom to communicate about substantive modifications or dissolution of the service.
- Reading and following the GC Notify terms of use ([https://notification.canada.ca/terms](https://notification.canada.ca/terms)).
- Avoiding any misuse of the service including using it for a purpose not previously discussed with CDS.
- Ensuring they have alternative service paths to complete the form.
- Leading the response to _Access to Information Act_ and _Privacy Act_ requests about information that passes through GC Forms related to a particular form as detailed in the _Financial Administration Act_:
  - [**_Access to Information Act_**](https://laws-lois.justice.gc.ca/eng/acts/A-1)  
  **(5)** For greater certainty, for the purposes of the [Access to Information Act](https://laws-lois.justice.gc.ca/eng/acts/A-1), the records of an entity to which the Treasury Board provides services under subsection (4) that are, on behalf of that entity, contained in or carried on the Treasury Board’s information technology systems are not under the control of the Treasury Board.
  - [**_Privacy Act_**](https://laws-lois.justice.gc.ca/eng/acts/P-21)  
  **(6)** For greater certainty, for the purposes of the [Privacy Act](https://laws-lois.justice.gc.ca/eng/acts/P-21), personal information that is collected by an entity to which the Treasury Board provides services under subsection (4) and that is, on behalf of that entity, contained in or carried on the Treasury Board’s information technology systems is not under the control of the Treasury Board.
- Providing GC Forms with access to performance measurement information for the purposes of system and form evaluation. This could include:
  * Service standard metrics before and after use of GC Forms.
  * Assessments of form submission quality and impacts on workflow.
  * Rates of program uptake/admission before and after use of GC forms.
- When processing forms with document upload that are **delivered via email**, ensuring whether an internal process is necessary to:
  * Manage any non-legitimate documents uploaded and submitted by end-users. For example, pornographic or disturbing content.
  * Implement content scanning measures for submissions with file upload to reduce the possibility of viruses or malicious software. (e.g., virus scanning done by departmental email services).
  * Address service or operational impacts due to end-users uploading documents to submissions for the purposes of spamming.
- When processing forms via the GC Forms retrieval API:
  * Providing GC Forms with the names and email addresses of the individual(s) responsible for integrating the API with client systems.
  * Ensuring that bearer and temporary tokens provided to clients are kept in a safe and secure environment on government provided and secured devices.
  * Ensuring that sharing bearer or temporary tokens are shared using encrypted methods.
  * Adapting the data response output (a JSON format) to the required specifications to integrate with the client’s systems.
  * Ensuring the integration with GC Forms retrieval API is current, including but not limited to: tokens are current, response submissions are being received in a usable format, and middleware is up to date.
- When processing forms via the GC Forms Vault
  * Adhering to your departmental guidance for acceptable device and network use.
  * Ensure that you don’t share your secure key with anyone.
  * Save a copy and confirm receipt of your form responses within 30 days of receiving a submission.
  * Report any problems with saved form responses.
  * Handle and save form responses in accordance with your privacy and retention policies. This is your official copy. Keep a copy of the form response for your own records.

### GC Forms infrastructure providers is responsible for:
1. Delivering emails with end-user data to the provided government email address(es).
- Providing Amazon AWS service cloud infrastructure.
- Enforcing the AWS terms of service. ([https://aws.amazon.com/service-terms/](https://aws.amazon.com/service-terms/))

CDS is not responsible for issues or outages with AWS infrastructure that may impact system uptime and availability. CDS is also not responsible for Amazon infrastructure failure, AWS, or SES. CDS is responsible for updating clients on any information pertaining to an AWS outage.

## Uptime guarantee

CDS guarantees that the GC Forms system shall have 99.0% uptime with no more than 1% downtime during regular business hours in a year.

CDS commits to a Service Availability Rate of 99.0%—excluding Urgent Scheduled Maintenance and Planned Maintenance Periods (as defined herein)—for the Hosted Services  across each Calendar Quarter in the Contract Period. This service-level agreement (SLA) covers Infrastructure running the  Codebase and the Database.

Downtime is defined as an unplanned interruption to the service resulting in a user perceptible reduction in the existing quality of service or an event that will impact the existing service to the customer.

As GC Forms uses a continuous delivery approach, sometimes patching multiple times a day without any downtime. If we have to plan any downtime we will contact clients with a one week notice and try to ensure that planned downtime does not interfere with their operation of the system.

This uptime guarantee excludes any downtime experienced by Amazon as they are our infrastructure provider. Amazon promises 99.9% uptime. ([https://aws.amazon.com/messaging/sla/](https://aws.amazon.com/messaging/sla/))

### Service response time and contacts
During Alpha, all support requests should be directed [toassistance+forms@cds-snc.freshdesk.com](mailto:toassistance+forms@cds-snc.freshdesk.com). CDS will respond within eight hours of receiving your request. Support is limited to 9am - 5pm on regular business days.

Service tickets will be closed after 10 days if there is no response from the client.

## Support

CDS shall provide reactive support services to monitor, track, and remedy issues raised by either its own internal monitoring tools or raised via the client reporting channels discussed and agreed between the Supplier and the Client.

Service Availability

|Issue|Initial response|Ongoing updates|
|:-|:-|:-|
|Service is unavailable|8 hours, during regular business hours|Every two hours thereafter|
|Service is affected (performance issues, intermittent errors)|1 business day|1 per (business) day|
|Service is functioning (e.g., data is being collected and received by client)|2 business days|2 business days|
  
Helpdesk Response

|Description|Initial response|Resolution*|
|:-|:-|:-|
|New ticket created in Freshdesk|1 business day|5 business days|
|Ticket with “Waiting on Customer” status|Not applicable|10 business days and will be closed if no further action is required|
|Service is affected (performance issues, intermittent errors)|1 business day|5 business days|
  
\* By resolution we mean: responding to client queries related to UI/technical aspects of the product, feature requests (turning service live, uploading logo, daily message limit increase), addressing problems related to login or account creation.

### Planned maintenance period 
A “Planned Maintenance Period” shall be defined as a complete or partial loss of Service Availability scheduled by the Supplier to allow the Supplier to perform normal maintenance work. CDS shall notify the Client of any Planned Maintenance Period no fewer than two (2) Business Days prior to the commencement of the applicable Planned Maintenance Period. Planned Maintenance Periods shall be scheduled for non-peak periods of activity.

A loss of Service Availability during a Planned Maintenance Period shall not be considered a Service Outage. A loss of Service Availability, which occurs outside of a Planned Maintenance Period but is caused by work performed during the Planned Maintenance Period, shall be considered to be a Service Outage for the purpose of calculating the Supplier’s compliance with the provisions of the Service Availability SLA. Information regarding Planned Maintenance Periods shall be disseminated initially by means of electronic mail.

### Notice of service deprecation
In case CDS is no longer able to support and operate GC Forms or GC Notify due to factors beyond its control, it will notify clients two months in advance via email to the account they signed up for GC Forms with.

In the event that CDS needs to depreciate the service GC Forms will work with clients to ensure they have the data collected and still retained by the product, as well as an options analysis for alternative solutions.

GC Forms is open source and available to stand up your own version based on the code found here ([https://github.com/cds-snc/platform-forms-client](https://github.com/cds-snc/platform-forms-client))
  
  

**Last Update**: 2022-10-11