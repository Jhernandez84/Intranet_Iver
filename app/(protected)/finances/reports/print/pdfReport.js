import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10 },
  section: { marginBottom: 10 },
  title: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  sedeHeader: {
    fontSize: 14,
    backgroundColor: "#f0f0f0",
    padding: 5,
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#eee",
    padding: 5,
  },
  col1: { width: "20%" },
  col2: { width: "50%" },
  col3: { width: "10%" },
  col4: { width: "20%", textAlign: "right" },
  bold: { fontWeight: "bold" },
});

export const MyReport = ({ data }) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.title}>Estado de Movimientos Financieros</Text>

      {Object.values(data).map((sede) => (
        <View key={sede.nombresede} style={styles.section}>
          <Text style={styles.sedeHeader}>{sede.nombresede}</Text>

          {/* Encabezado de tabla */}
          <View style={[styles.tableRow, styles.bold]}>
            <Text style={styles.col1}>Fecha / Tipo</Text>
            <Text style={styles.col2}>Tipo Mov.</Text>
            <Text style={styles.col3}>Estado</Text>
            <Text style={styles.col4}>Monto</Text>
          </View>

          {Object.entries(sede.meses).map(([mes, info]) => (
            <View key={mes}>
              {info.movimientos.map((m) => (
                <View key={m.id} style={styles.tableRow}>
                  <Text style={styles.col1}>
                    {m.fecha} - {m.tipo}
                  </Text>
                  <Text style={styles.col2}>{m.tipo_mov}</Text>
                  <Text style={styles.col3}>{m.estado}</Text>
                  <Text style={styles.col4}>$ {m.monto.toLocaleString()}</Text>
                </View>
              ))}
              <View style={[styles.tableRow, { borderTopWidth: 1 }]}>
                <Text style={styles.col1}>Total {mes}</Text>
                <Text style={styles.col4}>
                  Neto: $ {(info.ingresos - info.egresos).toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </Page>
  </Document>
);
