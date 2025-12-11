import UtilizationScaling from "../assets/UtilizationScaling.png"
import EmissionsScaling from "../assets/EmissionsScaling.png"
import WorkloadScaling from "../assets/WorkloadScaling.png"

function FurtherDetails() {
  return (
      <div className="py-20">
        <h2 id="FurtherDetails" className="text-3xl text-center">Further Details</h2>
        <p className="text-xl text-center py-14 w-1/2 mx-auto">Data center graphics processing units (GPUs) produce a significant and increasing amount of CO2 emissions. In the past, these have been predominantly due to energy generation for powering data centers. With the transition to energy sources with lower carbon production, the embodied carbon (i.e., CO2 and other greenhouse gas emissions during production, transport, and end-of-life) plays an increasing role when planning GPU lifecycles. While replacing an old GPU with a newer one will typically reduce the power consumption of individual tasks, due to better efficiency of modern GPUs, offsetting the embodied carbon of new hardware can take months to tens of years, depending on the grid carbon intensity.</p>
        <section id="LearnMore" className="grid grid-cols-2">
          <div>
            <h3 id="modelDescription">Model Description</h3>
            <p>Our tool computes the total carbon cost of ownership of a GPU, combining:</p>
            <ul>
              <li><span>Embodied Carbon Footprint (ECF):</span> emissions from manufacturing, transport, and disposal of the GPU</li>
              <li>Where total ECF = ECF<sub>Chip</sub> + ECF<sub>VRAM</sub></li>
              <li><span>Operational Carbon Footprint (OCF):</span> emissions from using the GPU, based on utilization, efficiency, and local grid carbon intensity.</li>
            </ul>
            <br />
            <p>A break-even point is reached when the combined operational and embodied carbon of the new GPU meets the operational carbon of the current GPU. We do not include the embodied carbon of the current GPU as we consider it to be amortized.</p>
          </div>
          <div>
            <h3>Measurements vs. Estimations</h3>
            <p>Our tool uses a mix of in-house performance measurements, published spec sheet data, and carbon estimates.</p>
            <ul>
              <li><span>Measurements:</span> Performance benchmarks (Matrix Multiplication, Radix Sort, TPXxAI) provide hardware performance ratios. These performance numbers were all measured in-house at HPI.</li>
              <li><span>Estimations:</span> Embodied carbon of components (GPU chip, GPU memory) are calculated using <a href="https://ugupta.com/files/Gupta_ISCA2022_ACT.pdf" className="underline">published frameworks</a>.</li>
              <li><span>Operational emissions:</span> Calculated from maximum power draw (TDP), average yearly country grid carbon intensity gathered from <a className="underline" href="https://www.electricitymaps.com/">Electricity Maps</a>, and normalized utilization.</li>
            </ul>
          </div>
          <div>
            <h3>Scaling Options</h3>
            <p>Our tool supports different methods of scaling to further mimick real world replacement scenarios:</p>
            <ul>
              <li><span>Utilization scaling:</span> Scales down the utilization on stronger hardware proportionally to its performance gain so that throughput stays comparable. <img className="mx-auto h-20 my-3" src={UtilizationScaling} /></li>
              <li><span>Emissions scaling:</span> Scales up emissions on weaker hardware to reflect an N-for-1 replacement scenario.<img  className="mx-auto h-32 my-3" src={EmissionsScaling} /></li>
              <li><span>Workload scaling:</span> Scales the workload size proportionally with the performance gain between upgrades.<img className="mx-auto h-20 my-3" src={WorkloadScaling} /></li>
            </ul>
          </div>
          <div>
            <h3>Limitations</h3>
            <p>Our tool serves as a basic estimation tool to compare the carbon footprint of GPU replacements, therefore a multitude of assumptions are made to keep the model simplistic.</p>
            <ul>
              <li>Embodied carbon values estimates rather than manufacturer-verified data. Our estimates based on the ACT model are conservative estimates relative to available (H100, B200) official numbers. This means that the break-even times gathered here are a lower bound estimate.</li>
              <li>The scope is limited to the GPU. We do not include other factors such as cooling, networking, and power consumption from other overheads such as material recycling/transportation. Other components of a server can be calculated using our <a href="https://hpides.github.io/TCO2/" className="underline" target="_blank">TCO2 tool</a>.</li>
              <li>Local grid carbon intensities, utilization levels, and workloads are assumed to be static, which do not reflect the fluctuating nature of real-world scenarios.</li>
            </ul>
          </div>
        </section>
      </div>
  )
}

export default FurtherDetails;
