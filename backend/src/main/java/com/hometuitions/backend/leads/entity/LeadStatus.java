package com.hometuitions.backend.leads.entity;

/** Shared triage status for every lead type - a lead always starts NEW, an admin marks
 *  it CONTACTED once someone has reached out, and CLOSED once resolved either way. */
public enum LeadStatus {
    NEW, CONTACTED, CLOSED
}
