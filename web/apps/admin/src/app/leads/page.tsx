"use client";

import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ContactMessageDto, LeadStatus, TuitionInquiryDto, TutorApplicationDto } from "@hometuitions/shared";
import { useState } from "react";
import { leadsApi } from "@/lib/api/leads";

const STATUS_COLOR: Record<LeadStatus, "info" | "warning" | "success"> = {
  NEW: "info",
  CONTACTED: "warning",
  CLOSED: "success",
};

const ADMIN_PHONES = [
  { label: "+91 80744 70640 (Primary)", phone: "918074470640" },
  { label: "+91 63036 19089 (Support)", phone: "916303619089" },
  { label: "+91 81432 41349 (Support)", phone: "918143241349" },
];

function StatusActions({
  status,
  pending,
  onUpdate,
  onView,
}: {
  status: LeadStatus;
  pending: boolean;
  onUpdate: (status: LeadStatus) => void;
  onView?: () => void;
}) {
  return (
    <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
      {onView && (
        <Button size="small" variant="text" onClick={onView} sx={{ fontWeight: 600 }}>
          View Details
        </Button>
      )}
      {status !== "CONTACTED" && status !== "CLOSED" && (
        <Button size="small" variant="outlined" disabled={pending} onClick={() => onUpdate("CONTACTED")}>
          Mark contacted
        </Button>
      )}
      {status !== "CLOSED" && (
        <Button size="small" variant="contained" disableElevation disabled={pending} onClick={() => onUpdate("CLOSED")}>
          Close
        </Button>
      )}
    </Stack>
  );
}

function DetailItem({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <Grid item xs={12} sm={6}>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.7rem" }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500, color: "text.primary", mt: 0.25 }}>
        {value}
      </Typography>
    </Grid>
  );
}

function TuitionInquiriesTab() {
  const queryClient = useQueryClient();
  const [selectedInquiry, setSelectedInquiry] = useState<TuitionInquiryDto | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "leads", "tuition-inquiries"],
    queryFn: () => leadsApi.listTuitionInquiries(),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      leadsApi.updateTuitionInquiryStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "leads", "tuition-inquiries"] }),
  });

  const rows = data?.content ?? [];

  const getWhatsappText = (inquiry: TuitionInquiryDto) => {
    return `*Tuition Inquiry Details - Vidya Home Tuitions*\n\n` +
      `*Parent/Student:* ${inquiry.parentName}\n` +
      `*Mobile:* +91 ${inquiry.mobile}\n` +
      `*Email:* ${inquiry.email || "N/A"}\n` +
      `*Grade & Board:* ${inquiry.grade} (${inquiry.board})\n` +
      `*Subject(s):* ${inquiry.subjects.join(", ")}\n` +
      `*Tuition Mode:* ${inquiry.tuitionMode}\n` +
      (inquiry.address ? `*Address:* ${inquiry.address}\n` : "") +
      `*Timings:* ${inquiry.timings}\n` +
      `*Frequency:* ${inquiry.frequency}\n` +
      `*Budget:* ${inquiry.budget}\n` +
      (inquiry.remarks ? `*Remarks:* ${inquiry.remarks}\n` : "") +
      `*Status:* ${inquiry.status}`;
  };

  return (
    <>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Parent</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Grade / board</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Subjects</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Mode</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Mobile</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{row.parentName}</TableCell>
                <TableCell>{row.grade} - {row.board}</TableCell>
                <TableCell>{row.subjects.join(", ")}</TableCell>
                <TableCell>{row.tuitionMode}</TableCell>
                <TableCell>
                  <a href={`tel:+91${row.mobile}`} style={{ color: "inherit", textDecoration: "none", fontWeight: 500 }}>
                    +91 {row.mobile}
                  </a>
                </TableCell>
                <TableCell>
                  <Chip size="small" color={STATUS_COLOR[row.status]} label={row.status} />
                </TableCell>
                <TableCell align="right">
                  <StatusActions
                    status={row.status}
                    pending={statusMutation.isPending}
                    onView={() => setSelectedInquiry(row)}
                    onUpdate={(status) => statusMutation.mutate({ id: row.id, status })}
                  />
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ color: "text.secondary", py: 4 }}>
                  No tuition inquiries yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Detail & WhatsApp Dialog */}
      <Dialog open={!!selectedInquiry} onClose={() => setSelectedInquiry(null)} maxWidth="md" fullWidth>
        {selectedInquiry && (
          <>
            <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>
              Tuition Inquiry: {selectedInquiry.parentName}
              <Chip size="small" color={STATUS_COLOR[selectedInquiry.status]} label={selectedInquiry.status} sx={{ ml: 1.5 }} />
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <DetailItem label="Parent / Student Name" value={selectedInquiry.parentName} />
                <DetailItem label="Contact Mobile" value={`+91 ${selectedInquiry.mobile}`} />
                <DetailItem label="Email Address" value={selectedInquiry.email || "N/A"} />
                <DetailItem label="Grade / Class" value={selectedInquiry.grade} />
                <DetailItem label="Board / Syllabus" value={selectedInquiry.board} />
                <DetailItem label="Tuition Mode" value={selectedInquiry.tuitionMode} />
                <DetailItem label="Subject(s)" value={selectedInquiry.subjects.join(", ")} />
                <DetailItem label="Preferred Timings" value={selectedInquiry.timings} />
                <DetailItem label="Weekly Frequency" value={selectedInquiry.frequency} />
                <DetailItem label="Monthly Budget" value={selectedInquiry.budget} />
                {selectedInquiry.address && <DetailItem label="Address / Locality" value={selectedInquiry.address} />}
                {selectedInquiry.remarks && <DetailItem label="Remarks / Special Notes" value={selectedInquiry.remarks} />}
                <DetailItem label="Submission Date" value={new Date(selectedInquiry.createdAt).toLocaleString()} />
              </Grid>

              <Divider sx={{ my: 2.5 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Direct Dispatch & Sharing Options:
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} flexWrap="wrap">
                {ADMIN_PHONES.map((admin) => (
                  <Button
                    key={admin.phone}
                    size="small"
                    variant="outlined"
                    color="success"
                    component="a"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://wa.me/${admin.phone}?text=${encodeURIComponent(getWhatsappText(selectedInquiry))}`}
                  >
                    WhatsApp to {admin.label}
                  </Button>
                ))}
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  component="a"
                  href={`mailto:vidyatutorspoint@gmail.com,sbharathreddy219@gmail.com?subject=${encodeURIComponent(`Inquiry Lead: ${selectedInquiry.parentName} - ${selectedInquiry.grade}`)}&body=${encodeURIComponent(getWhatsappText(selectedInquiry).replace(/\*/g, ""))}`}
                >
                  Email to Admins
                </Button>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedInquiry(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}

function TutorApplicationsTab() {
  const queryClient = useQueryClient();
  const [selectedTutor, setSelectedTutor] = useState<TutorApplicationDto | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "leads", "tutor-applications"],
    queryFn: () => leadsApi.listTutorApplications(),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      leadsApi.updateTutorApplicationStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "leads", "tutor-applications"] }),
  });

  const rows = data?.content ?? [];

  const isDocValid = (url?: string | null): boolean => {
    if (!url) return false;
    const trimmed = url.trim();
    return trimmed !== "N/A" && trimmed !== "-" && (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:"));
  };

  function getTutorWhatsappText(tutor: TutorApplicationDto): string {
    let text =
      `*TUTOR APPLICATION - VIDYA HOME TUITIONS*\n\n` +
      `*Name:* ${tutor.name}\n` +
      (tutor.fatherName ? `*Father's Name:* ${tutor.fatherName}\n` : "") +
      `*Mobile:* +91 ${tutor.mobile}\n` +
      `*WhatsApp:* +91 ${tutor.whatsapp}\n` +
      (tutor.alternativePhone ? `*Alternative Phone:* +91 ${tutor.alternativePhone}\n` : "") +
      `*Email:* ${tutor.email}\n` +
      `*Qualification:* ${tutor.qualification} (${tutor.percentage}% - ${tutor.passYear})\n` +
      `*College:* ${tutor.college}\n` +
      `*Grades:* ${tutor.grades.join(", ")}\n` +
      `*Subjects:* ${tutor.subjects.join(", ")}\n` +
      `*Boards:* ${tutor.boards.join(", ")}\n` +
      `*Localities:* ${tutor.localities} (${tutor.commuteDistance})\n` +
      `*Mode & Medium:* ${tutor.mode} | ${tutor.medium}\n` +
      `*Experience:* ${tutor.experience}\n` +
      `*Expected Pay:* ${tutor.expectedRate}\n` +
      `*Timings:* ${tutor.timings}\n` +
      (tutor.bio ? `*Bio:* ${tutor.bio}\n` : "");

    const hasDocs = isDocValid(tutor.photoUrl) || isDocValid(tutor.aadhaarUrl) || isDocValid(tutor.degreeUrl) || isDocValid(tutor.resumeUrl);
    if (hasDocs) {
      text += `\n*Attached Documents:*\n`;
      if (isDocValid(tutor.photoUrl)) text += `• Photo: ${tutor.photoUrl}\n`;
      if (isDocValid(tutor.aadhaarUrl)) text += `• Aadhaar: ${tutor.aadhaarUrl}\n`;
      if (isDocValid(tutor.degreeUrl)) text += `• Degree: ${tutor.degreeUrl}\n`;
      if (isDocValid(tutor.resumeUrl)) text += `• Resume: ${tutor.resumeUrl}\n`;
    }

    text += `\n*Status:* ${tutor.status}`;
    return text;
  }

  return (
    <>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Qualification</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Subjects</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Mode</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Documents</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                <TableCell>{row.qualification} ({row.percentage}%)</TableCell>
                <TableCell>{row.subjects.join(", ")}</TableCell>
                <TableCell>{row.mode}</TableCell>
                <TableCell>
                  <a href={`tel:+91${row.mobile}`} style={{ color: "inherit", textDecoration: "none", fontWeight: 500 }}>
                    +91 {row.mobile}
                  </a>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5}>
                    {isDocValid(row.photoUrl) && (
                      <Chip
                        size="small"
                        label="Photo"
                        color="primary"
                        variant="outlined"
                        component="a"
                        href={row.photoUrl!}
                        target="_blank"
                        clickable
                      />
                    )}
                    {isDocValid(row.aadhaarUrl) && (
                      <Chip
                        size="small"
                        label="Aadhaar"
                        color="success"
                        variant="outlined"
                        component="a"
                        href={row.aadhaarUrl!}
                        target="_blank"
                        clickable
                      />
                    )}
                    {isDocValid(row.degreeUrl) && (
                      <Chip
                        size="small"
                        label="Degree"
                        color="info"
                        variant="outlined"
                        component="a"
                        href={row.degreeUrl!}
                        target="_blank"
                        clickable
                      />
                    )}
                    {isDocValid(row.resumeUrl) && (
                      <Chip
                        size="small"
                        label="Resume"
                        color="warning"
                        variant="outlined"
                        component="a"
                        href={row.resumeUrl!}
                        target="_blank"
                        clickable
                      />
                    )}
                    {!isDocValid(row.photoUrl) && !isDocValid(row.aadhaarUrl) && !isDocValid(row.degreeUrl) && !isDocValid(row.resumeUrl) && (
                      <Typography variant="caption" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                        None
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip size="small" color={STATUS_COLOR[row.status]} label={row.status} />
                </TableCell>
                <TableCell align="right">
                  <StatusActions
                    status={row.status}
                    pending={statusMutation.isPending}
                    onView={() => setSelectedTutor(row)}
                    onUpdate={(status) => statusMutation.mutate({ id: row.id, status })}
                  />
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ color: "text.secondary", py: 4 }}>
                  No tutor applications yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Tutor Detail Dialog */}
      <Dialog open={!!selectedTutor} onClose={() => setSelectedTutor(null)} maxWidth="md" fullWidth>
        {selectedTutor && (
          <>
            <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>
              Tutor Profile: {selectedTutor.name}
              <Chip size="small" color={STATUS_COLOR[selectedTutor.status]} label={selectedTutor.status} sx={{ ml: 1.5 }} />
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <DetailItem label="Full Name" value={selectedTutor.name} />
                <DetailItem label="Father's Name" value={selectedTutor.fatherName || "N/A"} />
                <DetailItem label="Primary Mobile" value={`+91 ${selectedTutor.mobile}`} />
                <DetailItem label="WhatsApp Number" value={`+91 ${selectedTutor.whatsapp}`} />
                <DetailItem label="Email Address" value={selectedTutor.email} />
                <DetailItem label="Alternative Phone" value={selectedTutor.alternativePhone ? `+91 ${selectedTutor.alternativePhone}` : "N/A"} />
                <DetailItem label="Highest Degree" value={`${selectedTutor.qualification} (${selectedTutor.percentage}% - ${selectedTutor.passYear})`} />
                <DetailItem label="Graduation College" value={selectedTutor.college} />
                {selectedTutor.interCollege && <DetailItem label="12th / Intermediate" value={`${selectedTutor.interCollege} (${selectedTutor.interPercentage || ""})`} />}
                {selectedTutor.schoolName && <DetailItem label="10th Class School" value={`${selectedTutor.schoolName} (${selectedTutor.schoolPercentage || ""})`} />}
                <DetailItem label="Preferred Localities" value={`${selectedTutor.localities} (${selectedTutor.commuteDistance})`} />
                <DetailItem label="Classes / Grades" value={selectedTutor.grades.join(", ")} />
                <DetailItem label="Subjects" value={selectedTutor.subjects.join(", ")} />
                <DetailItem label="Target Boards" value={selectedTutor.boards.join(", ")} />
                <DetailItem label="Instruction Mode & Medium" value={`${selectedTutor.mode} | ${selectedTutor.medium}`} />
                <DetailItem label="Experience & Occupation" value={`${selectedTutor.experience} | ${selectedTutor.occupation}`} />
                <DetailItem label="Expected Rate" value={selectedTutor.expectedRate} />
                <DetailItem label="Available Timings" value={selectedTutor.timings} />
                {selectedTutor.bio && <DetailItem label="Short Bio" value={selectedTutor.bio} />}
                <DetailItem label="Applied On" value={new Date(selectedTutor.createdAt).toLocaleString()} />
              </Grid>

              {/* Attached Verification Documents */}
              <Divider sx={{ my: 2.5 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                📎 Attached Verification Documents:
              </Typography>
              <Grid container spacing={2}>
                {isDocValid(selectedTutor.photoUrl) && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper variant="outlined" sx={{ p: 1.5, textAlign: "center" }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, display: "block", mb: 1 }}>Profile Photo</Typography>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        component="a"
                        href={selectedTutor.photoUrl!}
                        target="_blank"
                        fullWidth
                      >
                        View Photo
                      </Button>
                    </Paper>
                  </Grid>
                )}

                {isDocValid(selectedTutor.aadhaarUrl) && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper variant="outlined" sx={{ p: 1.5, textAlign: "center" }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, display: "block", mb: 1 }}>Aadhaar Card</Typography>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        component="a"
                        href={selectedTutor.aadhaarUrl!}
                        target="_blank"
                        fullWidth
                      >
                        View Aadhaar
                      </Button>
                    </Paper>
                  </Grid>
                )}

                {isDocValid(selectedTutor.degreeUrl) && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper variant="outlined" sx={{ p: 1.5, textAlign: "center" }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, display: "block", mb: 1 }}>Degree / Marks</Typography>
                      <Button
                        size="small"
                        variant="contained"
                        color="info"
                        component="a"
                        href={selectedTutor.degreeUrl!}
                        target="_blank"
                        fullWidth
                      >
                        View Degree
                      </Button>
                    </Paper>
                  </Grid>
                )}

                {isDocValid(selectedTutor.resumeUrl) && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper variant="outlined" sx={{ p: 1.5, textAlign: "center" }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, display: "block", mb: 1 }}>Resume / CV</Typography>
                      <Button
                        size="small"
                        variant="contained"
                        color="warning"
                        component="a"
                        href={selectedTutor.resumeUrl!}
                        target="_blank"
                        fullWidth
                      >
                        View Resume
                      </Button>
                    </Paper>
                  </Grid>
                )}

                {!isDocValid(selectedTutor.photoUrl) && !isDocValid(selectedTutor.aadhaarUrl) && !isDocValid(selectedTutor.degreeUrl) && !isDocValid(selectedTutor.resumeUrl) && (
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                      No documents attached with this application.
                    </Typography>
                  </Grid>
                )}
              </Grid>

              <Divider sx={{ my: 2.5 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Direct Dispatch & Sharing Options:
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} flexWrap="wrap">
                {ADMIN_PHONES.map((admin) => (
                  <Button
                    key={admin.phone}
                    size="small"
                    variant="outlined"
                    color="success"
                    component="a"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://wa.me/${admin.phone}?text=${encodeURIComponent(getTutorWhatsappText(selectedTutor))}`}
                  >
                    WhatsApp to {admin.label}
                  </Button>
                ))}
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  component="a"
                  href={`mailto:vidyatutorspoint@gmail.com,sbharathreddy219@gmail.com?subject=${encodeURIComponent(`Tutor Application: ${selectedTutor.name} - ${selectedTutor.qualification}`)}&body=${encodeURIComponent(getTutorWhatsappText(selectedTutor).replace(/\*/g, ""))}`}
                >
                  Email to Admins
                </Button>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedTutor(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}


function ContactMessagesTab() {
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageDto | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "leads", "contact-messages"],
    queryFn: () => leadsApi.listContactMessages(),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      leadsApi.updateContactMessageStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "leads", "contact-messages"] }),
  });

  const rows = data?.content ?? [];

  const getContactWhatsappText = (msg: ContactMessageDto) => {
    return `*Contact Message - Vidya Home Tuitions*\n\n` +
      `*Name:* ${msg.name}\n` +
      `*Phone:* +91 ${msg.phone}\n` +
      `*Email:* ${msg.email || "N/A"}\n` +
      `*Message:* ${msg.message}\n` +
      `*Status:* ${msg.status}`;
  };

  return (
    <>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Message</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                <TableCell>
                  <a href={`tel:+91${row.phone}`} style={{ color: "inherit", textDecoration: "none", fontWeight: 500 }}>
                    +91 {row.phone}
                  </a>
                </TableCell>
                <TableCell sx={{ maxWidth: 320, whiteSpace: "normal" }}>{row.message}</TableCell>
                <TableCell>
                  <Chip size="small" color={STATUS_COLOR[row.status]} label={row.status} />
                </TableCell>
                <TableCell align="right">
                  <StatusActions
                    status={row.status}
                    pending={statusMutation.isPending}
                    onView={() => setSelectedMessage(row)}
                    onUpdate={(status) => statusMutation.mutate({ id: row.id, status })}
                  />
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: "text.secondary", py: 4 }}>
                  No contact messages yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Contact Message Dialog */}
      <Dialog open={!!selectedMessage} onClose={() => setSelectedMessage(null)} maxWidth="sm" fullWidth>
        {selectedMessage && (
          <>
            <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>
              Contact Message from: {selectedMessage.name}
              <Chip size="small" color={STATUS_COLOR[selectedMessage.status]} label={selectedMessage.status} sx={{ ml: 1.5 }} />
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <DetailItem label="Sender Name" value={selectedMessage.name} />
                <DetailItem label="Phone Number" value={`+91 ${selectedMessage.phone}`} />
                <DetailItem label="Email Address" value={selectedMessage.email || "N/A"} />
                <DetailItem label="Received On" value={new Date(selectedMessage.createdAt).toLocaleString()} />
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.7rem" }}>
                    Full Message
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 0.5, bgcolor: "background.default", whiteSpace: "pre-wrap" }}>
                    <Typography variant="body2">{selectedMessage.message}</Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2.5 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Direct Dispatch & Sharing Options:
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} flexWrap="wrap">
                {ADMIN_PHONES.map((admin) => (
                  <Button
                    key={admin.phone}
                    size="small"
                    variant="outlined"
                    color="success"
                    component="a"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://wa.me/${admin.phone}?text=${encodeURIComponent(getContactWhatsappText(selectedMessage))}`}
                  >
                    WhatsApp to {admin.label}
                  </Button>
                ))}
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  component="a"
                  href={`mailto:vidyatutorspoint@gmail.com,sbharathreddy219@gmail.com?subject=${encodeURIComponent(`Contact Inquiry: ${selectedMessage.name}`)}&body=${encodeURIComponent(getContactWhatsappText(selectedMessage).replace(/\*/g, ""))}`}
                >
                  Email to Admins
                </Button>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedMessage(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}

export default function LeadsPage() {
  const [tab, setTab] = useState(0);

  return (
    <>
      <Typography variant="h2" gutterBottom>
        Leads & Inquiries
      </Typography>

      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2 }}>
        <Tab label="Tuition Inquiries" />
        <Tab label="Tutor Applications" />
        <Tab label="Contact Messages" />
      </Tabs>

      {tab === 0 && <TuitionInquiriesTab />}
      {tab === 1 && <TutorApplicationsTab />}
      {tab === 2 && <ContactMessagesTab />}
    </>
  );
}
