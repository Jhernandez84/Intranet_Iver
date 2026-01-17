import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: "#333" },
  title: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  sedeSection: { marginBottom: 25 },
  sedeHeader: {
    fontSize: 12,
    backgroundColor: "#2563eb", // Azul profesional
    color: "white",
    padding: 6,
    fontWeight: "bold",
  },
  typeHeader: {
    fontSize: 10,
    backgroundColor: "#f3f4f6",
    padding: 4,
    marginTop: 10,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderColor: "#f0f0f0",
    paddingVertical: 4,
    paddingHorizontal: 5,
  },
  colLabel: { width: "70%" },
  colAmount: { width: "30%", textAlign: "right" },

  totalRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 5,
    backgroundColor: "#fafafa",
    fontWeight: "bold",
  },
  balanceBox: {
    marginTop: 10,
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 2,
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  bold: { fontWeight: "bold" },
  textGreen: { color: "#059669" },
  textRed: { color: "#dc2626" },
});

export const MyReportResumen = ({ data }) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.title}>Resumen Ejecutivo de Finanzas</Text>

      {Object.values(data).map((sede) => (
        <View key={sede.nombresede} style={styles.sedeSection}>
          {/* Nombre de la Sede */}
          <Text style={styles.sedeHeader}>{sede.nombresede.toUpperCase()}</Text>

          {/* Bloque de Ingresos */}
          <Text style={styles.typeHeader}>INGRESOS POR CATEGORÍA</Text>
          {Object.entries(sede.ingresos).map(([cat, monto]) => (
            <View key={cat} style={styles.tableRow}>
              <Text style={styles.colLabel}>{cat}</Text>
              <Text style={styles.colAmount}>$ {monto.toLocaleString()}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={[styles.colLabel, styles.bold]}>Total Ingresos</Text>
            <Text style={[styles.colAmount, styles.bold, styles.textGreen]}>
              + $ {sede.totalIngresos.toLocaleString()}
            </Text>
          </View>

          {/* Bloque de Egresos */}
          <Text style={styles.typeHeader}>EGRESOS POR CATEGORÍA</Text>
          {Object.entries(sede.egresos).map(([cat, monto]) => (
            <View key={cat} style={styles.tableRow}>
              <Text style={styles.colLabel}>{cat}</Text>
              <Text style={styles.colAmount}>$ {monto.toLocaleString()}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={[styles.colLabel, styles.bold]}>Total Egresos</Text>
            <Text style={[styles.colAmount, styles.bold, styles.textRed]}>
              - $ {sede.totalEgresos.toLocaleString()}
            </Text>
          </View>

          {/* Balance Neto de la Sede */}
          <View style={styles.balanceBox}>
            <Text style={[styles.colLabel, styles.bold]}>
              SALDO NETO OPERATIVO
            </Text>
            <Text style={[styles.colAmount, styles.bold]}>
              $ {(sede.totalIngresos - sede.totalEgresos).toLocaleString()}
            </Text>
          </View>
        </View>
      ))}

      {/* Pie de página con fecha de generación */}
      <Text
        style={{
          position: "absolute",
          bottom: 20,
          left: 40,
          fontSize: 8,
          color: "gray",
        }}
        render={({ pageNumber, totalPages }) =>
          `Reporte generado el ${new Date().toLocaleString()} - Página ${pageNumber} de ${totalPages}`
        }
      />
    </Page>
  </Document>
);
