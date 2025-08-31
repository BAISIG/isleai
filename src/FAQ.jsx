import React, { useState } from "react";
import { Link } from "react-router-dom";

const styles = {
  body: {
    margin: 0,
    padding: 0,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, sans-serif",
    background: "#f9fafb",
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  mainContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "24px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    background: "#f9fafb",
  },
  topNav: {
    display: "flex",
    alignItems: "center",
    padding: "12px 24px",
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    width: "100%",
    boxSizing: "border-box",
  },
  navItems: {
    display: "flex",
    gap: "24px",
    fontSize: "14px",
  },
  navItemsLink: {
    color: "#374151",
    textDecoration: "none",
  },
  navItemsLinkActive: {
    color: "#000000",
    fontWeight: 500,
  },
  helpSection: {
    background: "#ffffff",
    borderRadius: "8px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    width: "100%",
    boxSizing: "border-box",
  },
  sectionTitle: {
    fontSize: "24px",
    fontWeight: 600,
    marginBottom: "16px",
    color: "#111827",
  },
  faqList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  faqItem: {
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    overflow: "hidden",
  },
  faqQuestion: {
    padding: "16px",
    background: "#f9fafb",
    fontWeight: 500,
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqAnswer: {
    padding: "16px",
    borderTop: "1px solid #e5e7eb",
    lineHeight: 1.6,
  },
  tutorials: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px",
    marginTop: "24px",
    flexWrap: "wrap",
  },
  tutorialCard: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    overflow: "hidden",
    padding: "16px",
    width: "300px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  tutorialVideo: {
    marginBottom: "8px",
    background: "#f3f4f6",
    height: "200px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  videoPlaceholder: {
    background: "#e5e7eb",
    padding: "8px",
    borderRadius: "4px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "14px",
  },
  tutorialContent: {
    padding: "16px",
  },
  tutorialTitle: {
    fontWeight: 500,
    marginBottom: "8px",
    color: "#111827",
  },
  tutorialDescription: {
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: 1.5,
  },
  contactButton: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
    fontFamily: "inherit",
    fontSize: "14px",
  },
  logo: {
    height: "60px",
    marginRight: "16px",
  },
};

const EmailButton = () => {
  const email = "Info@cariventuresglobal.com";
  const subject = encodeURIComponent("ISLE AI Support");
  const body = encodeURIComponent("Hello, I have a question about ISLE AI.");

  return (
    <a
      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`}
      style={styles.contactButton}
      target="_blank"
      rel="noopener noreferrer"
    >
      Email Support
    </a>
  );
};

function HelpPage() {
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqItems = [
    {
      question: "What is ISLE AI, and how is it starting in Barbados?",
      answer:
        "ISLE AI is an innovative AI-driven platform launching in Barbados on August 31, 2025, designed to enhance user experiences with smart, personalized services. Starting in Barbados, it leverages the island’s growing AI ecosystem to deliver cutting-edge solutions, with plans for broader Caribbean expansion. Visit https://isleai.com for updates.",
    },
    {
      question: "Why are prompts limited in ISLE AI?",
      answer:
        "ISLE AI limits prompts (e.g., queries or requests) to optimize performance and ensure reliable responses, especially during the initial Barbados launch. This helps maintain system stability while serving a growing user base in a resource-efficient manner.",
    },
    {
      question: "How can I use ISLE AI in Barbados?",
      answer:
        "Sign up for ISLE AI through the app or website, available starting August 31, 2025. Use it to access AI-powered features like personalized recommendations or services tailored to your needs in Barbados, such as travel planning or local insights.",
    },
    {
      question: "How does ISLE AI protect my data in Barbados?",
      answer:
        "ISLE AI uses advanced encryption and complies with Barbados’ data protection regulations to safeguard your information. We prioritize user privacy and do not share data without consent. See our privacy policy at https://isleai.com for details.",
    },
    {
      question: "How will ISLE AI benefit Barbados?",
      answer:
        "ISLE AI aims to boost Barbados’ economy by creating tech jobs, fostering innovation, and supporting the island’s emergence as an AI hub. It aligns with local initiatives to upskill youth and drive sustainable growth through technology.",
    },
  ];

  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div style={styles.body}>
      <nav style={styles.topNav}>
        <Link to="/baje">
          <img src="/isle4.png" alt="ISLE AI Logo" style={styles.logo} />
        </Link>
        <div style={styles.navItems}>
          <a href="#" style={styles.navItemsLink}>
            Dashboard
          </a>
          <a href="#" style={styles.navItemsLink}>
            Workbench
          </a>
          <a
            href="#"
            style={{ ...styles.navItemsLink, ...styles.navItemsLinkActive }}
          >
            Help
          </a>
        </div>
      </nav>

      <div style={styles.mainContainer}>
        <section style={styles.helpSection}>
          <h2 style={styles.sectionTitle}>Frequently Asked Questions</h2>
          <div style={styles.faqList}>
            {faqItems.map((item, index) => (
              <div key={index} style={styles.faqItem}>
                <div
                  style={styles.faqQuestion}
                  onClick={() => toggleFAQ(index)}
                >
                  {item.question}
                  <span>{expandedFAQ === index ? "−" : "+"}</span>
                </div>
                {expandedFAQ === index && (
                  <div style={styles.faqAnswer}>{item.answer}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section style={styles.helpSection}>
          <h2 style={styles.sectionTitle}>Contact Support</h2>
          <EmailButton />
          <p style={{ marginTop: "12px", color: "#6b7280", fontSize: "14px" }}>
            If the button doesn't work, please email{" "}
            <a href="mailto:baisig246@gmail.com" style={{ color: "#007bff" }}>
              Info@cariventuresglobal.com
            </a>{" "}
            directly.
          </p>
        </section>
      </div>
    </div>
  );
}

export default HelpPage;