import type { Meta, StoryObj } from "@storybook/react";
import { InvestigationRenderer } from "./App";
import type { InvestigationContent } from "./schema";

const meta = {
  title: "Views/Investigation",
  component: InvestigationRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof InvestigationRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ColdCase: Story = {
  args: {
    data: {
      type: "investigation",
      version: "1.0",
      title: "Cold Case #1987-42: The Riverside Incident",
      evidence: [
        {
          id: "p1",
          label: "Marcus Webb",
          type: "person",
          description: "Last known person to see the victim. Alibi partially confirmed by workplace records.",
          tags: ["suspect", "interviewed", "alibi-partial"],
          metadata: { age: "42", occupation: "Warehouse manager", status: "Person of interest" },
        },
        {
          id: "p2",
          label: "Elena Torres",
          type: "person",
          description: "Neighbor who reported unusual activity on the night in question. Statement recorded.",
          tags: ["witness", "cooperative"],
          metadata: { relation: "Neighbor", interviewed: "2024-03-15" },
        },
        {
          id: "d1",
          label: "Phone Records",
          type: "document",
          description: "Call logs from the evening of March 12th showing three calls to an unregistered number.",
          tags: ["forensic", "digital", "key-evidence"],
          metadata: { source: "Subpoena", pages: "47" },
        },
        {
          id: "d2",
          label: "Autopsy Report",
          type: "document",
          description: "Official medical examiner report. Cause of death: blunt force trauma. Time of death estimated between 10pm and 2am.",
          tags: ["forensic", "official"],
          metadata: { examiner: "Dr. R. Patel", date: "2024-03-14" },
        },
        {
          id: "l1",
          label: "Riverside Park",
          type: "location",
          description: "Location where the victim was found. Evidence of a struggle near the eastern entrance.",
          tags: ["crime-scene", "processed"],
          metadata: { coordinates: "41.8781N, 87.6298W", processed: "2024-03-13" },
        },
        {
          id: "ev1",
          label: "Security Camera Footage",
          type: "event",
          description: "CCTV from nearby convenience store shows an unidentified figure at 11:47pm heading toward the park.",
          tags: ["digital", "key-evidence", "unresolved"],
          metadata: { timestamp: "2024-03-12 23:47", quality: "Low resolution" },
        },
        {
          id: "o1",
          label: "Blue Fiber Sample",
          type: "object",
          description: "Synthetic fiber recovered from the scene. Matches common work uniforms. Pending DNA analysis.",
          tags: ["forensic", "pending"],
          metadata: { material: "Polyester blend", lab: "State Crime Lab" },
        },
      ],
      connections: [
        { from: "p1", to: "l1", label: "frequented area", strength: "medium" },
        { from: "p1", to: "d1", label: "phone owner", strength: "strong" },
        { from: "p1", to: "o1", label: "matching uniform", strength: "weak" },
        { from: "p2", to: "l1", label: "lives nearby", strength: "strong" },
        { from: "ev1", to: "l1", label: "near location", strength: "strong" },
        { from: "d2", to: "l1", label: "found at", strength: "strong" },
        { from: "o1", to: "l1", label: "recovered from", strength: "strong" },
      ],
      notes: "Priority: obtain DNA results from blue fiber sample. Cross-reference unregistered phone number with known associates. Review additional CCTV from surrounding businesses. Re-interview Marcus Webb regarding timeline discrepancy between 10pm and midnight.",
    } satisfies InvestigationContent,
  },
};

export const ResearchProject: Story = {
  args: {
    data: {
      type: "investigation",
      version: "1.0",
      title: "Bronze Age Trade Networks in the Eastern Mediterranean",
      evidence: [
        {
          id: "auth1",
          label: "Dr. Sarah Chen",
          type: "person",
          description: "Lead archaeologist specializing in Bronze Age maritime trade. Published extensively on Uluburun wreck findings.",
          tags: ["lead-researcher", "maritime"],
          metadata: { affiliation: "Oxford University", h_index: "34" },
        },
        {
          id: "auth2",
          label: "Prof. Dimitri Kostas",
          type: "person",
          description: "Co-investigator with expertise in ancient metallurgy and copper ingot provenance analysis.",
          tags: ["co-investigator", "metallurgy"],
          metadata: { affiliation: "University of Athens", specialization: "Archaeometallurgy" },
        },
        {
          id: "doc1",
          label: "Uluburun Cargo Manifest Analysis",
          type: "document",
          description: "Comprehensive catalog of 354 copper ingots, 149 tin ingots, and associated trade goods recovered from the Uluburun shipwreck.",
          tags: ["primary-source", "peer-reviewed"],
          metadata: { journal: "Journal of Maritime Archaeology", year: "2023" },
        },
        {
          id: "doc2",
          label: "Lead Isotope Database",
          type: "document",
          description: "Compiled database of lead isotope ratios from copper sources across Cyprus, Anatolia, and the Levant.",
          tags: ["database", "analytical"],
          metadata: { samples: "1,247", coverage: "Eastern Mediterranean" },
        },
        {
          id: "art1",
          label: "Oxhide Copper Ingot #127",
          type: "object",
          description: "Well-preserved oxhide-shaped copper ingot with Cypro-Minoan inscription. Isotope analysis matches Cypriot ore sources.",
          tags: ["artifact", "inscribed", "key-find"],
          metadata: { weight: "29.3kg", origin: "Cyprus (Apliki mine)", date: "c. 1300 BCE" },
        },
        {
          id: "art2",
          label: "Canaanite Amphora Collection",
          type: "object",
          description: "Set of 14 Canaanite amphorae containing residues of terebinth resin, indicating luxury goods trade.",
          tags: ["artifact", "organic-residue"],
          metadata: { count: "14", contents: "Terebinth resin", origin: "Levantine coast" },
        },
        {
          id: "loc1",
          label: "Uluburun Wreck Site",
          type: "location",
          description: "Late Bronze Age shipwreck off the coast of southwestern Turkey. One of the most important underwater archaeological discoveries.",
          tags: ["wreck-site", "excavated"],
          metadata: { depth: "44-52m", excavation: "1984-1994" },
        },
        {
          id: "ev1",
          label: "Amarna Letters Period",
          type: "event",
          description: "Diplomatic correspondence era (c. 1360-1332 BCE) providing textual evidence of international gift exchange and trade agreements.",
          tags: ["historical-context", "textual"],
          metadata: { period: "c. 1360-1332 BCE", tablets: "382 known" },
        },
      ],
      connections: [
        { from: "auth1", to: "doc1", label: "authored", strength: "strong" },
        { from: "auth2", to: "doc2", label: "compiled", strength: "strong" },
        { from: "auth1", to: "loc1", label: "excavated", strength: "strong" },
        { from: "art1", to: "loc1", label: "recovered from", strength: "strong" },
        { from: "art2", to: "loc1", label: "recovered from", strength: "strong" },
        { from: "art1", to: "doc2", label: "isotope match", strength: "strong" },
        { from: "doc1", to: "ev1", label: "contextualizes", strength: "medium" },
        { from: "auth2", to: "art1", label: "analyzed", strength: "strong" },
      ],
      notes: "Next steps: 1) Complete isotope analysis of remaining 12 ingots. 2) Compare Cypro-Minoan marks with known sign lists. 3) Submit grant application for neutron activation analysis of amphora residues. 4) Schedule collaboration meeting with Dr. Chen and Prof. Kostas for September symposium paper.",
    } satisfies InvestigationContent,
  },
};

export const SecurityAudit: Story = {
  args: {
    data: {
      type: "investigation",
      version: "1.0",
      title: "Security Incident Investigation: Unauthorized Access - Jan 2025",
      evidence: [
        {
          id: "evt1",
          label: "Anomalous Login Detected",
          type: "event",
          description: "Multiple failed login attempts from IP 203.0.113.42 followed by successful authentication using compromised service account credentials.",
          tags: ["critical", "initial-access", "brute-force"],
          metadata: { timestamp: "2025-01-15 02:34 UTC", source_ip: "203.0.113.42", account: "svc-deploy-01" },
        },
        {
          id: "evt2",
          label: "Privilege Escalation",
          type: "event",
          description: "Service account used to create new admin user 'maint_backup' with full cluster access. Action logged in Kubernetes audit trail.",
          tags: ["critical", "privilege-escalation"],
          metadata: { timestamp: "2025-01-15 02:41 UTC", method: "kubectl create clusterrolebinding", target: "cluster-admin" },
        },
        {
          id: "evt3",
          label: "Data Exfiltration Attempt",
          type: "event",
          description: "Large outbound data transfer detected to external endpoint. Approximately 2.3GB transferred before network controls activated.",
          tags: ["critical", "exfiltration", "data-loss"],
          metadata: { timestamp: "2025-01-15 03:12 UTC", volume: "2.3GB", destination: "198.51.100.0/24", blocked_at: "03:18 UTC" },
        },
        {
          id: "doc1",
          label: "Kubernetes Audit Log",
          type: "document",
          description: "Full audit trail showing all API server requests during the incident window. Contains evidence of lateral movement across namespaces.",
          tags: ["log", "primary-evidence"],
          metadata: { timeframe: "02:00-04:00 UTC", entries: "14,327", format: "JSON" },
        },
        {
          id: "doc2",
          label: "Vulnerability Assessment Report",
          type: "document",
          description: "Prior assessment from December identifying the service account as having excessive permissions. Remediation was scheduled but not completed.",
          tags: ["pre-incident", "gap-analysis"],
          metadata: { date: "2024-12-01", severity: "High", status: "Remediation pending" },
        },
        {
          id: "loc1",
          label: "Production Kubernetes Cluster",
          type: "location",
          description: "Primary production environment hosting customer-facing services. Three worker nodes, one control plane.",
          tags: ["infrastructure", "affected"],
          metadata: { provider: "AWS EKS", region: "us-east-1", namespaces: "12" },
        },
        {
          id: "loc2",
          label: "Staging Environment",
          type: "location",
          description: "Staging cluster where initial credential compromise likely occurred. Shares service account credentials with production.",
          tags: ["infrastructure", "entry-point"],
          metadata: { provider: "AWS EKS", region: "us-east-1", isolation: "Shared VPC" },
        },
        {
          id: "obj1",
          label: "Compromised Service Account Key",
          type: "object",
          description: "Long-lived API key for svc-deploy-01. Created 18 months ago with no rotation policy. Key has been revoked.",
          tags: ["credential", "revoked"],
          metadata: { created: "2023-07-20", rotated: "Never", revoked: "2025-01-15 03:25 UTC" },
        },
      ],
      connections: [
        { from: "evt1", to: "obj1", label: "used credential", strength: "strong" },
        { from: "evt1", to: "loc2", label: "originated from", strength: "strong" },
        { from: "evt1", to: "evt2", label: "led to", strength: "strong" },
        { from: "evt2", to: "loc1", label: "targeted", strength: "strong" },
        { from: "evt2", to: "evt3", label: "enabled", strength: "strong" },
        { from: "doc1", to: "evt1", label: "documents", strength: "strong" },
        { from: "doc1", to: "evt2", label: "documents", strength: "strong" },
        { from: "doc2", to: "obj1", label: "identified risk", strength: "medium" },
        { from: "loc2", to: "loc1", label: "shared credentials", strength: "strong" },
        { from: "obj1", to: "loc1", label: "grants access", strength: "strong" },
      ],
      notes: "Immediate actions completed:\n- Revoked compromised service account key\n- Deleted unauthorized admin user\n- Enabled network policy blocking external transfers\n\nRemediation required:\n- Implement credential rotation policy (max 90 days)\n- Separate staging and production service accounts\n- Deploy runtime security monitoring (Falco)\n- Complete VPC isolation between environments\n- Conduct tabletop exercise for incident response team",
    } satisfies InvestigationContent,
  },
};
