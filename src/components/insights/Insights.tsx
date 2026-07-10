import React from "react";
import { Insight } from "../../Types";
import { Table } from "../table/Table";

type InsightType = 'campaigns' | 'adsets' | 'ads';

interface InsightsSectionProps {
    title: string;
    data: any[];
    columns: { key: string; label: string }[];
    insightColumns: { key: string; label: string }[];
    expanded: Record<string, Insight[]>;
    fetchInsights: (id: string, type: InsightType) => void | Promise<void>;
    type: InsightType;
}

export const InsightsSection: React.FC<InsightsSectionProps> = ({
title, data, columns, insightColumns, expanded, fetchInsights, type,
}) => {
return (
    <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <Table data={data} columns={columns} />
        {data.map(item => (
            <div key={item.id} className="mt-4">
            <button
                onClick={() => fetchInsights(item.id, type)}
                className="text-sm bg-amber-100 p-2 rounded text-black cursor-pointer"
            >
                {expanded[item.id] ? 'Hide Insights' : 'Show Insights'}
            </button>
            {expanded[item.id] && (
                <div className="mt-2">
                <Table data={expanded[item.id]} columns={insightColumns} />
                </div>
            )}
            </div>
        ))}
    </section>
);
};
