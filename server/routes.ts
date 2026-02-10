import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated, isPrivacyOfficer } from "./auth";
import { insertIncidentSchema, insertIncidentNoteSchema, insertIncidentDocumentSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Resend } from "resend";

// Resend email configuration
const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('Email not configured - RESEND_API_KEY required');
    return null;
  }
  return new Resend(apiKey);
};

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Incident routes - Privacy Officer only
  app.get("/api/incidents", isPrivacyOfficer, async (req, res) => {
    try {
      const { status, priority } = req.query;
      const incidents = await storage.getIncidents(
        status as string | undefined,
        priority as string | undefined
      );
      res.json(incidents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch incidents" });
    }
  });

  app.get("/api/incidents/:id", isAuthenticated, async (req, res) => {
    try {
      const incident = await storage.getIncident(req.params.id);
      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }
      res.json(incident);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch incident" });
    }
  });

  // Incident reporting endpoint - Requires authentication but reporter can remain anonymous
  app.post("/api/incidents/report", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertIncidentSchema.parse(req.body);
      const incident = await storage.createIncident(validatedData);

      // Send notification to Privacy Officer
      const poEmail = process.env.PRIVACY_OFFICER_EMAIL;
      const resend = getResend();

      if (poEmail && resend) {
        try {
          await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: poEmail,
            subject: `🚨 New Security Incident Reported - ID: ${incident.id}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc2626;">New Security Incident Reported</h2>

                <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0;">
                  <p style="margin: 0; font-weight: bold;">Immediate Action Required</p>
                  <p style="margin: 8px 0 0 0;">A new security incident has been reported and requires investigation.</p>
                </div>

                <h3 style="color: #374151; margin-top: 24px;">Incident Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 8px; font-weight: bold; width: 40%;">Incident ID:</td>
                    <td style="padding: 8px;">${incident.id}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 8px; font-weight: bold;">Incident Date:</td>
                    <td style="padding: 8px;">${incident.incidentDate}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 8px; font-weight: bold;">Discovery Date:</td>
                    <td style="padding: 8px;">${incident.discoveryDate}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 8px; font-weight: bold;">Reporter:</td>
                    <td style="padding: 8px;">${incident.reporterName}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 8px; font-weight: bold;">Reporter Email:</td>
                    <td style="padding: 8px;">${incident.reporterEmail}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 8px; font-weight: bold;">PHI Involved:</td>
                    <td style="padding: 8px;">${incident.phiInvolved ? '⚠️ YES' : 'No'}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 8px; font-weight: bold;">Priority:</td>
                    <td style="padding: 8px; text-transform: uppercase;">${incident.priority}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; font-weight: bold; vertical-align: top;">Description:</td>
                    <td style="padding: 8px;">${incident.description}</td>
                  </tr>
                </table>

                <div style="margin: 24px 0; padding: 16px; background: #f3f4f6; border-radius: 8px;">
                  <h4 style="margin: 0 0 12px 0; color: #374151;">Next Steps:</h4>
                  <ol style="margin: 0; padding-left: 20px;">
                    <li style="margin-bottom: 8px;">Log into the dashboard to review full details</li>
                    <li style="margin-bottom: 8px;">Begin investigation and document findings</li>
                    <li style="margin-bottom: 8px;">Implement containment actions if needed</li>
                    <li style="margin-bottom: 8px;">Determine if OCR reporting is required</li>
                  </ol>
                </div>

                <a href="${process.env.APP_URL || 'http://localhost:5005'}/incident/${incident.id}"
                   style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white;
                          text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 16px;">
                  View Incident in Dashboard
                </a>

                <p style="color: #6b7280; font-size: 12px; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
                  This is an automated notification from your HIPAA Incident Management System.
                  <br>Reported at: ${new Date().toLocaleString()}
                </p>
              </div>
            `
          });
          console.log(`Privacy Officer notified: ${poEmail}`);
        } catch (emailError) {
          console.error('Failed to send PO notification:', emailError);
          // Don't fail the incident creation if email fails
        }
      } else {
        console.log('Privacy Officer email not configured - notification skipped');
      }

      res.status(201).json({
        message: "Incident reported successfully",
        incidentId: incident.id,
        status: incident.status
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to report incident" });
      }
    }
  });

  app.post("/api/incidents", isPrivacyOfficer, async (req, res) => {
    try {
      const validatedData = insertIncidentSchema.parse(req.body);
      const incident = await storage.createIncident(validatedData);
      res.status(201).json(incident);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create incident" });
      }
    }
  });

  app.put("/api/incidents/:id", isPrivacyOfficer, async (req, res) => {
    try {
      const validatedData = insertIncidentSchema.partial().parse(req.body);
      const incident = await storage.updateIncident(req.params.id, validatedData);
      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }
      res.json(incident);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to update incident" });
      }
    }
  });

  app.delete("/api/incidents/:id", isPrivacyOfficer, async (req, res) => {
    try {
      const deleted = await storage.deleteIncident(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Incident not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete incident" });
    }
  });

  // Incident notes routes - Authenticated users
  app.get("/api/incidents/:incidentId/notes", isAuthenticated, async (req, res) => {
    try {
      const notes = await storage.getIncidentNotes(req.params.incidentId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.post("/api/incidents/:incidentId/notes", isAuthenticated, async (req, res) => {
    try {
      const noteData = {
        incidentId: req.params.incidentId,
        note: req.body.note,
        userId: req.body.userId
      };
      const validatedData = insertIncidentNoteSchema.parse(noteData);
      const note = await storage.createIncidentNote(validatedData);
      res.status(201).json(note);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create note" });
      }
    }
  });

  // Incident documents routes - Authenticated users
  app.get("/api/incidents/:incidentId/documents", isAuthenticated, async (req, res) => {
    try {
      const documents = await storage.getIncidentDocuments(req.params.incidentId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post("/api/incidents/:incidentId/documents", isAuthenticated, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const documentData = {
        incidentId: req.params.incidentId,
        name: req.body.name || req.file.originalname,
        fileName: req.file.filename,
        fileSize: `${Math.round(req.file.size / 1024)} KB`
      };

      const validatedData = insertIncidentDocumentSchema.parse(documentData);
      const document = await storage.createIncidentDocument(validatedData);
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to upload document" });
      }
    }
  });

  app.delete("/api/documents/:id", isPrivacyOfficer, async (req, res) => {
    try {
      const document = await storage.getIncidentDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      const filePath = path.join(uploadDir, document.fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      const deleted = await storage.deleteIncidentDocument(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Statistics - Privacy Officer only
  app.get("/api/stats", isPrivacyOfficer, async (req, res) => {
    try {
      const incidents = await storage.getIncidents();
      const stats = {
        totalIncidents: incidents.length,
        reported: incidents.filter(i => i.status === 'reported').length,
        investigating: incidents.filter(i => i.status === 'investigating').length,
        contained: incidents.filter(i => i.status === 'contained').length,
        resolved: incidents.filter(i => i.status === 'resolved').length,
        reportedToOcr: incidents.filter(i => i.status === 'reported_to_ocr').length,
        critical: incidents.filter(i => i.priority === 'critical').length,
        phiInvolved: incidents.filter(i => i.phiInvolved).length,
        pendingOcrReport: incidents.filter(i => i.ocrReportRequired && !i.ocrReportDate).length
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Generate report - Privacy Officer only
  app.get("/api/reports/annual/:year", isPrivacyOfficer, async (req, res) => {
    try {
      const year = req.params.year;
      const incidents = await storage.getIncidentsByYear(year);
      const report = {
        year,
        totalIncidents: incidents.length,
        byStatus: {
          reported: incidents.filter(i => i.status === 'reported').length,
          investigating: incidents.filter(i => i.status === 'investigating').length,
          contained: incidents.filter(i => i.status === 'contained').length,
          resolved: incidents.filter(i => i.status === 'resolved').length,
          reportedToOcr: incidents.filter(i => i.status === 'reported_to_ocr').length
        },
        byPriority: {
          low: incidents.filter(i => i.priority === 'low').length,
          medium: incidents.filter(i => i.priority === 'medium').length,
          high: incidents.filter(i => i.priority === 'high').length,
          critical: incidents.filter(i => i.priority === 'critical').length
        },
        phiBreaches: incidents.filter(i => i.phiInvolved).length,
        ocrReportsRequired: incidents.filter(i => i.ocrReportRequired).length,
        ocrReportsSubmitted: incidents.filter(i => i.ocrReportDate).length,
        incidents: incidents
      };
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  // Annual reminder endpoint (to be called by scheduler in late December) - Privacy Officer only
  // Note: OCR deadline is March 1, so reminders should go out ~60 days before (early January or late December)
  app.post("/api/reminders/annual", isPrivacyOfficer, async (req, res) => {
    try {
      const year = new Date().getFullYear().toString();
      const emails = await storage.getReporterEmailsForYear(year);
      const resend = getResend();
      const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';

      const results = {
        sent: [] as string[],
        failed: [] as string[],
        skipped: [] as string[]
      };

      for (const email of emails) {
        if (!email || email === 'N/A' || !email.includes('@')) {
          results.skipped.push(email || 'empty');
          continue;
        }

        if (resend) {
          try {
            await resend.emails.send({
              from: emailFrom,
              to: email,
              subject: `HIPAA Incident Reporting Reminder - OCR Portal Deadline March 1, ${parseInt(year) + 1}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #1e40af;">Annual OCR Reporting Reminder</h2>
                  <p>This is a reminder that all HIPAA security incidents must be reported to the
                  <a href="https://ocrportal.hhs.gov/ocr/breach/wizard_breach.jsf">HHS Office for Civil Rights (OCR) Breach Portal</a>
                  by <strong>March 1, ${parseInt(year) + 1}</strong>.</p>

                  <h3 style="color: #374151;">What You Need to Do:</h3>
                  <ul>
                    <li>Review all incidents reported in ${year}</li>
                    <li>Ensure all breaches affecting 500+ individuals have been reported</li>
                    <li>Submit annual report for breaches affecting fewer than 500 individuals</li>
                    <li>Document all OCR confirmation numbers</li>
                  </ul>

                  <h3 style="color: #374151;">OCR Portal:</h3>
                  <p><a href="https://ocrportal.hhs.gov/ocr/breach/wizard_breach.jsf" style="color: #2563eb;">
                    https://ocrportal.hhs.gov/ocr/breach/wizard_breach.jsf
                  </a></p>

                  <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
                    This is an automated reminder from your HIPAA Incident Management System.
                  </p>
                </div>
              `
            });
            results.sent.push(email);
            await storage.createAnnualReminder(email, year);
            console.log(`Annual OCR reminder sent to: ${email}`);
          } catch (emailError) {
            console.error(`Failed to send email to ${email}:`, emailError);
            results.failed.push(email);
          }
        } else {
          // No email configured - just log
          await storage.createAnnualReminder(email, year);
          console.log(`Annual OCR reminder logged for: ${email} (email not configured)`);
          results.skipped.push(email);
        }
      }

      res.json({
        message: `Annual reminders processed: ${results.sent.length} sent, ${results.failed.length} failed, ${results.skipped.length} skipped`,
        results
      });
    } catch (error) {
      console.error('Annual reminder error:', error);
      res.status(500).json({ message: "Failed to send annual reminders" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
