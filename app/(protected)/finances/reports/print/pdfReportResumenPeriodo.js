import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// MANTENGO TUS ESTILOS ORIGINALES
const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10 },
  section: { marginBottom: 15 }, // Ajustado ligeramente para separar meses
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

export const MyReportPeriodSummary = ({ data }) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.title}>Estado de Movimientos Financieros</Text>

      {/* 1. Mapeo de Meses */}
      {data.map((mes) => (
        <View key={mes.label} style={styles.section}>
          {/* Título del Mes */}
          <Text
            style={[
              styles.sedeHeader,
              { backgroundColor: "#2c3e50", color: "white" },
            ]}
          >
            {mes.label}
          </Text>

          {/* 2. Mapeo de Sedes dentro del Mes */}
          {Object.values(mes.sedes).map((sede) => (
            <View key={sede.nombresede}>
              <Text style={[styles.sedeHeader, { fontSize: 11 }]}>
                Sede: {sede.nombresede}
              </Text>

              {/* Encabezado de tabla (Se mantiene igual) */}
              <View style={[styles.tableRow, styles.bold]}>
                <Text style={styles.col1}>Fecha / Tipo</Text>
                <Text style={styles.col2}>Tipo Mov.</Text>
                <Text style={styles.col3}>Estado</Text>
                <Text style={styles.col4}>Monto</Text>
              </View>

              {/* 3. Mapeo de Movimientos (Se mantiene igual) */}
              {sede.movimientos.map((m) => (
                <View key={m.id} style={styles.tableRow}>
                  <Text style={styles.col1}>
                    {new Date(m.fecha).toLocaleDateString()}
                  </Text>
                  <Text style={styles.col2}>{m.tipo_mov}</Text>
                  <Text style={styles.col3}>{m.estado || m.tipo}</Text>
                  <Text style={styles.col4}>
                    $ {Number(m.monto).toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          ))}

          {/* Resumen del Mes (Uso tu estilo de fila con borde) */}
          <View style={[styles.tableRow, { borderTopWidth: 2, marginTop: 5 }]}>
            <Text style={[styles.col1, styles.bold]}>
              TOTAL {mes.label.toUpperCase()}
            </Text>
            <Text style={[styles.col4, styles.bold, { width: "80%" }]}>
              Neto Mensual: ${" "}
              {(mes.totalIngresos - mes.totalEgresos).toLocaleString()}
            </Text>
          </View>
        </View>
      ))}
    </Page>
  </Document>
);
