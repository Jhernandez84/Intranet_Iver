import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10 },
  section: { marginBottom: 15 },
  title: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  monthHeader: {
    fontSize: 14,
    backgroundColor: "#2c3e50",
    color: "white",
    padding: 5,
    marginTop: 10,
    textTransform: "capitalize",
  },
  sedeHeader: {
    fontSize: 11,
    backgroundColor: "#f0f0f0",
    padding: 4,
    marginTop: 5,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#eee",
    padding: 5,
  },
  col1: { width: "70%" }, // Ahora es para el Concepto
  col2: { width: "10%" }, // Tipo (Ingreso/Egreso)
  col3: { width: "20%", textAlign: "right" }, // Monto Total
  bold: { fontWeight: "bold" },
});

export const MyReportPeriodSummary2 = ({ data }) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.title}>Resumen Consolidado por Mes</Text>

      {data.map((mes) => (
        <View key={mes.label} style={styles.section}>
          {/* Encabezado Enero-2026 */}
          <Text style={styles.monthHeader}>{mes.label}</Text>

          {Object.values(mes.sedes).map((sede) => (
            <View key={sede.nombresede}>
              <Text style={styles.sedeHeader}>Sede: {sede.nombresede}</Text>

              {/* Encabezado de tabla adaptado */}
              <View
                style={[
                  styles.tableRow,
                  styles.bold,
                  { backgroundColor: "#fafafa" },
                ]}
              >
                <Text style={styles.col1}>Concepto / Tipo de Movimiento</Text>
                <Text style={styles.col2}>Tipo</Text>
                <Text style={styles.col3}>Total</Text>
              </View>

              {/* Mapeo de Conceptos Agrupados */}
              {Object.values(sede.conceptos).map((concepto, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.col1}>{concepto.nombre}</Text>
                  <Text style={styles.col2}>{concepto.tipoRaiz}</Text>
                  <Text
                    style={[
                      styles.col3,
                      {
                        color:
                          concepto.tipoRaiz === "Egreso"
                            ? "#e74c3c"
                            : "#27ae60",
                      },
                    ]}
                  >
                    $ {concepto.monto.toLocaleString()}
                  </Text>
                </View>
              ))}

              {/* Subtotal Sede */}
              <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.col1, { textAlign: "right" }]}>
                  Total Sede:
                </Text>
                <Text style={[styles.col3, styles.bold]}>
                  ${" "}
                  {Object.values(sede.conceptos)
                    .reduce(
                      (sum, c) =>
                        c.tipoRaiz === "Ingreso"
                          ? sum + c.monto
                          : sum - c.monto,
                      0,
                    )
                    .toLocaleString()}
                </Text>
              </View>
            </View>
          ))}

          {/* Resumen Final del Mes */}
          <View
            style={[
              styles.tableRow,
              { borderTopWidth: 2, marginTop: 5, backgroundColor: "#fdfdfd" },
            ]}
          >
            <Text style={[styles.col1, styles.bold]}>
              BALANCE FINAL {mes.label.toUpperCase()}
            </Text>
            <Text style={[styles.col3, styles.bold]}>
              $ {(mes.totalIngresos - mes.totalEgresos).toLocaleString()}
            </Text>
          </View>
        </View>
      ))}
    </Page>
  </Document>
);
