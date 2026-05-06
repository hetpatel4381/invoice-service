export const InvoicePDF = ({
  invoice,
  renderer,
}: {
  invoice: any;
  renderer: typeof import("@react-pdf/renderer");
}) => {
  const { Document, Page, Text, View, StyleSheet } = renderer;

  const styles = StyleSheet.create({
    page: { padding: 20 },
    section: { marginBottom: 10 },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text>Invoice: {invoice.number}</Text>
          <Text>Customer: {invoice.customerName}</Text>
          <Text>Email: {invoice.customerEmail}</Text>
        </View>

        <View style={styles.section}>
          <Text>Items:</Text>
          {invoice.lineItems.map((item: any, index: number) => (
            <Text key={index}>
              {item.description} - {item.quantity} × {item.unitPriceMinor}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text>Subtotal: {invoice.subtotalMinor}</Text>
          <Text>Tax: {invoice.taxMinor}</Text>
          <Text>Total: {invoice.totalMinor}</Text>
        </View>
      </Page>
    </Document>
  );
};
