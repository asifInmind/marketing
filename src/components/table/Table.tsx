interface TableProps {
    data: any[];
    columns: { key: string; label: string }[];
}

export const Table: React.FC<TableProps> = ({ data, columns }) => {
    return (
        <table className="min-w-full text-left border">
            <thead>
                <tr>
                {columns.map(col => (
                    <th key={col.key} className="px-4 py-2 border">{col.label}</th>
                ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row, idx) => (
                <tr key={idx} className="border">
                    {columns.map(col => (
                    <td key={col.key} className="px-4 py-2 border">{row[col.key]}</td>
                    ))}
                </tr>
                ))}
            </tbody>
        </table>
    );
};
