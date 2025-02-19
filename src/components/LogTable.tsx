import { InstitutionData } from "@/types/institution";

interface LogEntry extends InstitutionData {
  timestamp: string;
}

interface LogTableProps {
  logs: LogEntry[];
}

export default function LogTable({ logs }: LogTableProps) {
  if (logs.length === 0) return null;

  return (
    <div className="mt-4 overflow-x-auto rounded-2xl border border-neutral-200 shadow-sm">
      <table className="min-w-full divide-y divide-neutral-200">
        <thead className="bg-neutral-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Institution ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              City
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              State
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Country
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Postal Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Latitude
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Longitude
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Library Type
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200">
          {logs.map((log, index) => (
            <tr
              key={index}
              className={index % 2 === 0 ? "bg-white" : "bg-neutral-50"}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                {log.timestamp}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                {log.institution_identifier}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                {log.institutionName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                {log.City}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                {log.State}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                {log.Country}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                {log.postalCd}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                {log.latitude}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                {log.longitude}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                {log.libTypeUser}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                {log.libraryType}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
