import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { modelRunsData } from '@/lib/mock-data';

export function ModelRunsTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Model Runs</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Model Name</TableHead>
              <TableHead>Accuracy</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modelRunsData.map((run) => (
              <TableRow key={run.id}>
                <TableCell className="font-medium">{run.modelName}</TableCell>
                <TableCell>{run.accuracy}</TableCell>
                <TableCell>{run.date}</TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={
                      run.status === 'Active'
                        ? 'default'
                        : run.status === 'Completed'
                        ? 'secondary'
                        : 'destructive'
                    }
                    className={`${run.status === 'Active' ? 'bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-500/20' : ''} ${run.status === 'Completed' ? 'bg-blue-500/20 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-500/20' : ''} ${run.status === 'Failed' ? 'bg-red-500/20 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-500/20' : ''}`}
                  >
                    {run.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
