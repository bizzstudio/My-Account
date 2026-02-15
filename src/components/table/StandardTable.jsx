import { Table } from "@windmill/react-ui";

const StandardTable = ({ children }) => {
  return (
    <Table className="w-full">
      {children}
    </Table>
  );
};

export default StandardTable;
    