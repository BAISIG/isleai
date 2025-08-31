import React from 'react';
import { useNavigate } from 'react-router-dom';

function Packages() {
  return (
    <>
      <style jsx>{`
        body {
          margin: 0;
          padding: 0;
          font-family: Inter, system-ui, -apple-system, sans-serif;
          min-height: 100vh;
          width: 100vw;
          background: linear-gradient(135deg, #000000, #1e90ff);
          color: #fff;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow-y: auto;
        }
        .container {
          max-width: 1200px;
          width: 100%;
          padding: 40px 20px;
          box-sizing: border-box;
          flex: 1 1 auto;
          display: flex;
          flex-direction: column;
        }
        .header {
          text-align: center;
          margin-bottom: 60px;
        }
        .headerH1 {
          font-size: 40px;
          margin: 0;
          background: linear-gradient(to right, #4ade80, #22d3ee);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          color: white;
        }
        .packagesGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-bottom: 40px;
          width: 100%;
          box-sizing: border-box;
          flex-grow: 1;
        }
        .packageCard {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 30px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: transform 0.3s ease;
          box-sizing: border-box;
        }
        .packageName {
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 20px 0;
          color: #4ade80;
        }
        .packagePrice {
          font-size: 36px;
          font-weight: 700;
          margin: 0 0 20px 0;
        }
        .period {
          font-size: 16px;
          opacity: 0.7;
        }
        .featuresList {
          list-style: none;
          padding: 0;
          margin: 0 0 30px 0;
        }
        .featuresListItem {
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .featureCheck {
          color: #4ade80;
          font-weight: bold;
          margin-right: 10px;
        }
        .ctaButton {
          width: 100%;
          padding: 15px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(to right, #4ade80, #22d3ee);
          color: white;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .enterpriseNote {
          text-align: center;
          max-width: 600px;
          margin: 40px auto 20px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 10px;
          box-sizing: border-box;
        }

        /* Mobile Portrait (320px to 374px) */
        @media (min-width: 320px) and (max-width: 374px) {
          body {
            padding: 8px;
            align-items: flex-start;
            min-height: 100vh;
            overflow-y: auto;
          }
          .container {
            padding: 20px 10px;
          }
          .header {
            margin-bottom: 30px;
          }
          .headerH1 {
            font-size: 28px;
          }
          .packagesGrid {
            grid-template-columns: 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          .packageCard {
            padding: 20px;
            border-radius: 12px;
          }
          .packageName {
            font-size: 20px;
            margin: 0 0 15px 0;
          }
          .packagePrice {
            font-size: 28px;
            margin: 0 0 15px 0;
          }
          .period {
            font-size: 13px;
          }
          .featuresList {
            margin: 0 0 20px 0;
          }
          .featuresListItem {
            margin-bottom: 10px;
            gap: 8px;
          }
          .featureCheck {
            margin-right: 8px;
          }
          .ctaButton {
            padding: 12px;
            font-size: 14px;
            border-radius: 8px;
          }
          .enterpriseNote {
            margin: 20px auto 20px;
            padding: 15px;
            border-radius: 8px;
            max-width: 90%;
          }
        }

        /* Mobile Portrait (375px to 424px) */
        @media (min-width: 375px) and (max-width: 424px) {
          body {
            padding: 8px;
            align-items: flex-start;
            min-height: 100vh;
            overflow-y: auto;
          }
          .container {
            padding: 25px 12px;
          }
          .header {
            margin-bottom: 35px;
          }
          .headerH1 {
            font-size: 30px;
          }
          .packagesGrid {
            grid-template-columns: 1fr;
            gap: 22px;
            margin-bottom: 25px;
          }
          .packageCard {
            padding: 22px;
            border-radius: 14px;
          }
          .packageName {
            font-size: 22px;
            margin: 0 0 16px 0;
          }
          .packagePrice {
            font-size: 30px;
            margin: 0 0 16px 0;
          }
          .period {
            font-size: 14px;
          }
          .featuresList {
            margin: 0 0 22px 0;
          }
          .featuresListItem {
            margin-bottom: 10px;
            gap: 8px;
          }
          .featureCheck {
            margin-right: 8px;
          }
          .ctaButton {
            padding: 13px;
            font-size: 15px;
            border-radius: 8px;
          }
          .enterpriseNote {
            margin: 25px auto 20px;
            padding: 16px;
            border-radius: 8px;
            max-width: 90%;
          }
        }

        /* Mobile Portrait (425px to 479px) */
        @media (min-width: 425px) and (max-width: 479px) {
          body {
            padding: 8px;
            align-items: flex-start;
            min-height: 100vh;
            overflow-y: auto;
          }
          .container {
            padding: 25px 15px;
          }
          .header {
            margin-bottom: 40px;
          }
          .headerH1 {
            font-size: 32px;
          }
          .packagesGrid {
            grid-template-columns: 1fr;
            gap: 25px;
            margin-bottom: 25px;
          }
          .packageCard {
            padding: 25px;
            border-radius: 15px;
          }
          .packageName {
            font-size: 22px;
            margin: 0 0 18px 0;
          }
          .packagePrice {
            font-size: 32px;
            margin: 0 0 18px 0;
          }
          .period {
            font-size: 14px;
          }
          .featuresList {
            margin: 0 0 25px 0;
          }
          .featuresListItem {
            margin-bottom: 11px;
            gap: 9px;
          }
          .featureCheck {
            margin-right: 9px;
          }
          .ctaButton {
            padding: 14px;
            font-size: 15px;
            border-radius: 9px;
          }
          .enterpriseNote {
            margin: 25px auto 20px;
            padding: 18px;
            border-radius: 9px;
            max-width: 90%;
          }
        }

        /* Mobile Landscape (481px to 767px) */
        @media (min-width: 481px) and (max-width: 767px) {
          body {
            padding: 12px;
            align-items: flex-start;
            min-height: 100vh;
            overflow-y: auto;
          }
          .container {
            padding: 30px 15px;
          }
          .header {
            margin-bottom: 45px;
          }
          .headerH1 {
            font-size: 34px;
          }
          .packagesGrid {
            grid-template-columns: 1fr;
            gap: 25px;
            margin-bottom: 30px;
          }
          .packageCard {
            padding: 25px;
            border-radius: 16px;
          }
          .packageName {
            font-size: 22px;
            margin: 0 0 18px 0;
          }
          .packagePrice {
            font-size: 32px;
            margin: 0 0 18px 0;
          }
          .period {
            font-size: 15px;
          }
          .featuresList {
            margin: 0 0 25px 0;
          }
          .featuresListItem {
            margin-bottom: 11px;
            gap: 9px;
          }
          .featureCheck {
            margin-right: 9px;
          }
          .ctaButton {
            padding: 14px;
            font-size: 15px;
            border-radius: 9px;
          }
          .enterpriseNote {
            margin: 30px auto 20px;
            padding: 18px;
            border-radius: 9px;
            max-width: 85%;
          }
        }

        /* Tablet Portrait and Landscape (768px to 1024px) */
        @media (min-width: 768px) and (max-width: 1024px) {
          body {
            padding: 16px;
            min-height: 100vh;
            overflow-y: auto;
          }
          .container {
            padding: 35px 18px;
          }
          .header {
            margin-bottom: 50px;
          }
          .headerH1 {
            font-size: 36px;
          }
          .packagesGrid {
            grid-template-columns: 1fr;
            gap: 28px;
            margin-bottom: 35px;
          }
          .packageCard {
            padding: 28px;
            border-radius: 18px;
          }
          .packageName {
            font-size: 23px;
            margin: 0 0 20px 0;
          }
          .packagePrice {
            font-size: 34px;
            margin: 0 0 20px 0;
          }
          .period {
            font-size: 15px;
          }
          .featuresList {
            margin: 0 0 28px 0;
          }
          .featuresListItem {
            margin-bottom: 12px;
            gap: 10px;
          }
          .featureCheck {
            margin-right: 10px;
          }
          .ctaButton {
            padding: 15px;
            font-size: 16px;
            border-radius: 10px;
          }
          .enterpriseNote {
            margin: 35px auto 20px;
            padding: 20px;
            border-radius: 10px;
            max-width: 80%;
          }
        }
      `}</style>
      <div className="body">
        <div className="container">
          <header className="header">
            <h1 className="headerH1">ISLE AI Subscription Packages</h1>
          </header>
          <div className="packagesGrid">
            <PackageCard
              name="Free"
              price="$0"
              period="/month"
              features={[
                "15 hours access to Main Agent",
                "6 hours access to Traffic & Tourism agents",
                "Text and voice features",
                "Basic support",
              ]}
              buttonText="Get Started Free"
            />
            <PackageCard
              name="Basic"
              price="$5.00"
              period="/month (in USD)"
              features={[
                "24/7 access to all agents",
                "Text and voice features",
                "Chart visualization",
                "Priority support",
              ]}
              buttonText="Subscribe Now"
            />
            <PackageCard
              name="Pro"
              price="$10.00"
              period="/month (in USD)"
              features={[
                "All Regular features",
                "Interactive maps",
                "XR capabilities",
                "Premium support",
              ]}
              buttonText="Upgrade"
            />
          </div>
          <div className="enterpriseNote">
            <h3>Organizations & Government Entities</h3>
            <p>
              We offer custom enterprise solutions tailored to your specific needs.
              Contact our sales team for a personalized quote and detailed consultation.
            </p>
            <button className="ctaButton">Request Custom Quote</button>
          </div>
        </div>
      </div>
    </>
  );
}

function PackageCard({ name, price, period, features, buttonText }) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (price !== "$0" && buttonText !== "Contact Sales") {
      navigate('/payment-card', { state: { amount: price.replace('$', '') } });
    }
  };

  return (
    <div className="packageCard">
      <div className="packageName">{name}</div>
      <div className="packagePrice">
        {price} <span className="period">{period}</span>
      </div>
      <ul className="featuresList">
        {features.map((feature, i) => (
          <li key={i} className="featuresListItem">
            <span className="featureCheck">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      <button className="ctaButton" onClick={handleClick}>
        {buttonText}
      </button>
    </div>
  );
}

export default Packages;