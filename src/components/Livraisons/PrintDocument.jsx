import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode.react";
import Barcode from "react-barcode";
import {
  FaBox,
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaWeightHanging,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
} from "react-icons/fa";

const PrintDocument = ({ livraison }) => {
  const printRef = useRef();

  if (!livraison) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "Non définie";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      en_attente: "En attente",
      prise_en_charge_ramassage: "Prise en charge",
      ramasse: "Ramasse",
      en_transit: "En transit",
      prise_en_charge_livraison: "En livraison",
      livre: "Livré",
      annule: "Annulé",
    };
    return statusLabels[status] || status.replace(/_/g, " ");
  };

  // Données pour QR Code
  const qrData = JSON.stringify({
    id: livraison.id,
    code_pin: livraison.code_pin,
    colis_label: livraison.demande_livraison?.colis?.colis_label || "N/A",
    status: livraison.status,
    client: `${livraison.client?.prenom || ""} ${livraison.client?.nom || ""}`,
    destinataire: `${livraison.destinataire?.prenom || ""} ${livraison.destinataire?.nom || ""}`,
    date: new Date().toISOString(),
  });

  // Référence du colis pour le code-barres
  const barcodeValue =
    livraison.demande_livraison?.colis?.colis_label || `COLIS-${livraison.id}`;

  // Date d'impression
  const printDate = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div
      ref={printRef}
      className="print-document"
      id="print-document"
      style={{
        width: "380px",
        border: "2px solid #000",
        padding: "10px",
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        background: "#fff",
        margin: "0 auto",
      }}
    >
      {/* En-tête avec logo */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{ fontWeight: "bold", fontSize: "18px", color: "#1e40af" }}
          >
            LIVEXPRESS
          </div>
          <div style={{ fontSize: "10px", color: "#666" }}>
            Service de Livraison Express
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div
            style={{
              background: "#3cb44a",
              color: "#fff",
              padding: "3px 6px",
              fontWeight: "bold",
              fontSize: "11px",
            }}
          >
            E-COMMERCE
          </div>
          <div
            style={{
              background: "#c62828",
              color: "#fff",
              padding: "3px",
              marginTop: "4px",
              fontSize: "20px",
              fontWeight: "bold",
              textAlign: "center",
              width: "40px",
              marginLeft: "auto",
            }}
          >
            SD
          </div>
        </div>
      </div>

      {/* QR Code + Expéditeur */}
      <div style={{ display: "flex", marginTop: "10px" }}>
        <div style={{ marginRight: "10px" }}>
          <QRCode value={qrData} size={90} level="H" includeMargin={true} />
          <div
            style={{ fontSize: "9px", textAlign: "center", marginTop: "4px" }}
          >
            Scan pour suivi
          </div>
        </div>

        <div>
          <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
            <FaUser style={{ fontSize: "10px", marginRight: "4px" }} />
            Expéditeur #{livraison.client?.id || "N/A"}
          </div>
          <div style={{ marginBottom: "2px" }}>
            <FaMapMarkerAlt
              style={{ fontSize: "10px", marginRight: "4px", color: "#666" }}
            />
            {livraison.demande_livraison?.addresse_depot ||
              "Adresse non définie"}
          </div>
          <div style={{ marginBottom: "2px" }}>
            {livraison.client?.prenom || ""} {livraison.client?.nom || "Client"}
          </div>
          <div>
            <FaPhone
              style={{ fontSize: "10px", marginRight: "4px", color: "#666" }}
            />
            {livraison.client?.telephone || "N/A"}
          </div>
        </div>
      </div>

      {/* Destinataire */}
      <div style={{ marginTop: "10px" }}>
        <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
          <FaUser style={{ fontSize: "10px", marginRight: "4px" }} />
          Destinataire
        </div>
        <div style={{ marginBottom: "2px" }}>
          {livraison.destinataire?.prenom || ""}{" "}
          {livraison.destinataire?.nom || "Destinataire"}
        </div>
        <div style={{ marginBottom: "2px" }}>
          <FaMapMarkerAlt
            style={{ fontSize: "10px", marginRight: "4px", color: "#666" }}
          />
          {livraison.demande_livraison?.addresse_delivery ||
            "Adresse non définie"}
        </div>
        <div>
          <FaPhone
            style={{ fontSize: "10px", marginRight: "4px", color: "#666" }}
          />
          {livraison.destinataire?.telephone || "N/A"}
        </div>
      </div>

      {/* Code ville et statut */}
      <div
        style={{ textAlign: "right", marginTop: "-70px", marginRight: "10px" }}
      >
        <div
          style={{
            fontSize: "48px",
            fontWeight: "bold",
            color: "#1e40af",
            lineHeight: "1",
          }}
        >
          {livraison.id.toString().padStart(3, "0")}
        </div>
        <div style={{ fontWeight: "bold", fontSize: "14px" }}>
          {getStatusLabel(livraison.status)}
        </div>
        <div style={{ fontSize: "11px", color: "#666" }}>
          Réf: #{livraison.id}
        </div>
      </div>

      {/* Code-barres */}
      <div style={{ marginTop: "15px", textAlign: "center" }}>
        <div style={{ marginBottom: "8px" }}>
          {barcodeValue && (
            <Barcode
              value={barcodeValue}
              height={50}
              width={1.5}
              fontSize={12}
              background="#fff"
              lineColor="#000"
              displayValue={false}
            />
          )}
        </div>
        <div
          style={{ fontWeight: "bold", fontSize: "14px", letterSpacing: "1px" }}
        >
          {barcodeValue}
        </div>
        <div
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            color: "#c62828",
            marginTop: "4px",
          }}
        >
          PIN: {livraison.code_pin}
        </div>
      </div>

      {/* Tableau des informations */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "10px",
          border: "1px solid #000",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                border: "1px solid #000",
                padding: "4px",
                background: "#f3f4f6",
                textAlign: "left",
              }}
            >
              Description
            </th>
            <th
              style={{
                border: "1px solid #000",
                padding: "4px",
                background: "#f3f4f6",
                textAlign: "left",
              }}
            >
              Détails
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: "1px solid #000", padding: "4px" }}>
              <FaBox style={{ fontSize: "10px", marginRight: "4px" }} />
              Référence colis
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "4px",
                fontWeight: "bold",
              }}
            >
              {livraison.demande_livraison?.colis?.colis_label || "N/A"}
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: "4px" }}>
              <FaTag style={{ fontSize: "10px", marginRight: "4px" }} />
              Type
            </td>
            <td style={{ border: "1px solid #000", padding: "4px" }}>
              {livraison.demande_livraison?.colis?.colis_type || "Standard"}
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: "4px" }}>
              <FaWeightHanging
                style={{ fontSize: "10px", marginRight: "4px" }}
              />
              Poids
            </td>
            <td style={{ border: "1px solid #000", padding: "4px" }}>
              {livraison.demande_livraison?.colis?.poids || "0"} kg
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: "4px" }}>
              <FaMoneyBillWave
                style={{ fontSize: "10px", marginRight: "4px" }}
              />
              Prix
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "4px",
                fontWeight: "bold",
                color: "#065f46",
              }}
            >
              {livraison.demande_livraison?.prix || "0"} DH
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: "4px" }}>
              <FaCalendarAlt style={{ fontSize: "10px", marginRight: "4px" }} />
              Date création
            </td>
            <td style={{ border: "1px solid #000", padding: "4px" }}>
              {formatDate(livraison.created_at)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Livreurs */}
      <div
        style={{
          marginTop: "10px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontWeight: "bold",
              fontSize: "11px",
              marginBottom: "2px",
            }}
          >
            <FaTruck style={{ fontSize: "10px", marginRight: "4px" }} />
            Ramasseur
          </div>
          <div style={{ fontSize: "11px" }}>
            {livraison.livreur_ramasseur
              ? `${livraison.livreur_ramasseur.prenom || ""} ${livraison.livreur_ramasseur.nom || ""}`
              : "Non attribué"}
          </div>
          {livraison.livreur_ramasseur?.telephone && (
            <div style={{ fontSize: "10px", color: "#666" }}>
              {livraison.livreur_ramasseur.telephone}
            </div>
          )}
        </div>

        <div style={{ flex: 1, textAlign: "right" }}>
          <div
            style={{
              fontWeight: "bold",
              fontSize: "11px",
              marginBottom: "2px",
            }}
          >
            <FaTruck style={{ fontSize: "10px", marginRight: "4px" }} />
            Distributeur
          </div>
          <div style={{ fontSize: "11px" }}>
            {livraison.livreur_distributeur
              ? `${livraison.livreur_distributeur.prenom || ""} ${livraison.livreur_distributeur.nom || ""}`
              : "Non attribué"}
          </div>
          {livraison.livreur_distributeur?.telephone && (
            <div style={{ fontSize: "10px", color: "#666" }}>
              {livraison.livreur_distributeur.telephone}
            </div>
          )}
        </div>
      </div>

      {/* Instructions spéciales */}
      {livraison.demande_livraison?.info_additionnel && (
        <div
          style={{
            marginTop: "8px",
            padding: "6px",
            background: "#fef3c7",
            border: "1px dashed #d97706",
            fontSize: "11px",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              marginBottom: "2px",
              color: "#92400e",
            }}
          >
            <FaInfoCircle style={{ fontSize: "10px", marginRight: "4px" }} />
            Instructions spéciales
          </div>
          <div style={{ fontStyle: "italic" }}>
            {livraison.demande_livraison.info_additionnel}
          </div>
        </div>
      )}

      {/* Pied de page */}
      <div
        style={{
          marginTop: "10px",
          fontSize: "10px",
          borderTop: "1px solid #ddd",
          paddingTop: "8px",
        }}
      >
        <div>
          Départ:{" "}
          {livraison.demande_livraison?.addresse_depot?.split(",")[0] || "N/A"}
          <span style={{ float: "right" }}>le: {printDate}</span>
        </div>

        <div style={{ marginTop: "6px", fontWeight: "bold" }}>
          Signature & Déclaration
        </div>
        <p
          style={{
            marginTop: "4px",
            fontSize: "9px",
            lineHeight: "1.3",
            fontStyle: "italic",
          }}
        >
          Je, {livraison.client?.prenom || ""}{" "}
          {livraison.client?.nom || "le client"}, certifie que les détails
          déclarés sur ce bordereau sont corrects et que le colis ne contient
          aucun produit dangereux ou interdit par la loi ou les conditions
          générales de transport.
        </p>

        <div
          style={{
            textAlign: "center",
            fontSize: "8px",
            color: "#666",
            marginTop: "8px",
            borderTop: "1px solid #eee",
            paddingTop: "4px",
          }}
        >
          Document généré automatiquement • Référence: #{livraison.id} • Valide
          jusqu'au: {formatDate(livraison.date_livraison)}
        </div>
      </div>
    </div>
  );
};

export default PrintDocument;
