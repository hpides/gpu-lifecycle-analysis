import { useBenchmarkContext } from "../utility/BenchmarkContext";
import { addCommaToNumber, yearToYearAndMonth, BLANK_SPACE, withinXPercent } from "../utility/UtilityFunctions";
import { ListItem } from "../utility/ListItems";

function DetailedBreakdown() {
  const { comparison, intersect, workload, singleComparison, oldPerformanceIndicator, newPerformanceIndicator, oldPowerConsumption, newPowerConsumption } = useBenchmarkContext();

  const year = intersect ? yearToYearAndMonth(Number(intersect.x.toFixed(1)), false, true) : "No Break-Even";
  const total = intersect ? addCommaToNumber(Number(intersect.y.toFixed(1))) + " kgCO₂" : "No Break-even";
  const embodiedCarbon = Number(comparison.newSystemOpex[0].toFixed(1));

  const titleText = singleComparison ? 'Current' : 'New'

  let perfRatio :any = (newPerformanceIndicator / oldPerformanceIndicator)
  let consumptionRatio :any = (newPowerConsumption / oldPowerConsumption)

  const ratioDecimalPlaces = withinXPercent(perfRatio, consumptionRatio, 0.1) ? 3 : 1;
  perfRatio = perfRatio.toFixed(ratioDecimalPlaces).replace(/\.000$/, '');
  consumptionRatio = consumptionRatio.toFixed(ratioDecimalPlaces).replace(/\.000$/, '');

  let oldPerfFormatted = oldPerformanceIndicator.toFixed(1).replace(/\.0$/, '');
  let newPerfFormatted = newPerformanceIndicator.toFixed(1).replace(/\.0$/, '');
  let oldConsumptionFormatted = oldPowerConsumption.toFixed(3).replace(/\.0$/, '');
  let newConsumptionFormatted = newPowerConsumption.toFixed(3).replace(/\.0$/, '');

  newPerfFormatted = addCommaToNumber(Number(newPerfFormatted));
  oldPerfFormatted = addCommaToNumber(Number(oldPerfFormatted));

  return (
    <div className="flex flex-col px-2 py-4 gap-10">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-4 gap-4">
          {/* Left Side - 2x2 Grid */}
          <ul className="grid grid-cols-3 col-span-5 gap-4 grow">
            <ListItem
              label="Break-Even Time"
              value={`${year}`}
              borderColor="var(--color-hpi-red)"
            />
            <ListItem
              label={`Embodied Carbon of ${titleText} Hardware`}
              value={`${addCommaToNumber(embodiedCarbon)} kgCO₂`}
              borderColor={singleComparison ? "var(--color-hpi-current)" : "var(--color-hpi-new)"}
            />
            <ListItem
              label="Total CO₂ until Break-Even"
              value={`${total}`}
              borderColor="var(--color-hpi-orange)"
            />
          </ul>
          <div className="flex flex-col border-2 border-hpi-orange rounded-lg px-1 py-1 col-span-5">
            {
              /*
               * styling for table can be found in style.css
               */
            }
            <table id="breakdown-table" className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-1/3 border-r">{BLANK_SPACE}</th>
                  <th className="w-1/3 text-left border-r"><p>({workload})</p><p>Performance Indicator</p></th>
                  <th className="w-1/3 text-left align-bottom"><p>Power</p><p>Consumption</p></th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="breakdown-table-first-col">Current Hardware</td>
                  <td className="border-r table-val">{oldPerfFormatted}</td>
                  <td className="table-val">{oldConsumptionFormatted} kW</td>
                </tr>
                {
                  !singleComparison &&
                    <>
                      <tr className="border-t border-b">
                        <td className="breakdown-table-first-col">New Hardware</td>
                        <td className="border-r table-val">{newPerfFormatted}</td>
                        <td className="table-val">{newConsumptionFormatted} kW</td>
                      </tr>
                      <tr className="border-t">
                        <td className="breakdown-table-first-col">Ratio</td>
                        <td className="border-r table-val">{perfRatio}</td>
                        <td className="table-val">{consumptionRatio}</td>
                      </tr>
                    </>
                }
              </tbody>
            </table>
          </div>
        </div>
        <div className="hidden flex-col border-2 border-hpi-orange rounded-lg px-3 py-2 col-span-5">
          <p className="font-semibold">{workload} Performance indicator:</p>
          <table className="text-lg">
            <tr>
              <td>Current Hardware:</td>
              <td>{oldPerfFormatted}</td>
            </tr>
            {
              !singleComparison &&
                <>
                  <tr>
                    <td>New Hardware:</td>
                    <td>{newPerfFormatted}</td>
                  </tr>
                  <tr>
                    <td>Ratio:</td>
                    <td>{perfRatio}</td>
                  </tr>
                </>
            }
          </table>
          <p className="font-semibold">Total Power Consumption:</p>
          <table className="text-lg">
            <tr>
              <td>Current Hardware:</td>
              <td>{oldConsumptionFormatted} kW</td>
            </tr>
            {
              !singleComparison &&
                <>
                  <tr>
                    <td>New Hardware:</td>
                    <td>{newConsumptionFormatted} kW</td>
                  </tr>
                  <tr>
                    <td>Ratio:</td>
                    <td>{consumptionRatio}</td>
                  </tr>
                </>
            }
          </table>
        </div>
      </div>
    </div>
  );
}

export default DetailedBreakdown;
