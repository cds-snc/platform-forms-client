import React from "react";
import ReactDOM from "react-dom";
import Drawer from "./index";
import "./demo.css";


function Demo() {
  const [isOpen, setIsOpen] = React.useState(true);
  
  return (
    <>
      <React.StrictMode>
        <button onClick={() => setIsOpen(true)}>Open Drawer</button>
        <Drawer
          isVisible={isOpen}
          onClose={() => setIsOpen(false)}
          duration={250}
          hideScrollbars={true}
          className="drawer"
        >
          <h1> React Bottom Drawers! </h1>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque commodo vitae sapien in gravida. Donec fermentum nibh interdum, laoreet arcu sit amet, condimentum enim. Duis justo est, commodo vel ultricies ut, consequat vel velit. Aliquam erat volutpat. Integer vel erat ut ipsum interdum ornare. Vivamus vitae quam cursus, varius lorem ut, aliquet eros. Aenean rhoncus nisl sit amet lorem dapibus, eu placerat odio tempus. Ut justo ipsum, tempor quis rutrum nec, aliquam et nunc. Donec nec nisi nec ligula vehicula venenatis eu nec lorem. Aliquam nec sagittis lectus. Quisque sapien ligula, elementum non rutrum et, laoreet ut lectus. In a elit id tortor volutpat tempus eget vitae tellus. Vivamus iaculis odio tellus, id egestas velit consectetur nec. Phasellus molestie elit in lacinia aliquam.
          </p>
          
          <p>
            In vel semper nisl. Praesent felis augue, hendrerit ac scelerisque vel, bibendum ut turpis. Aliquam volutpat purus massa, vitae consequat arcu lacinia at. Suspendisse vitae mattis turpis. Donec sit amet rutrum est, eu posuere nibh. Vivamus imperdiet sed est in aliquet. Aenean libero massa, consequat nec convallis sed, iaculis nec quam. Maecenas vel rutrum lorem. Nullam eu hendrerit odio, quis consequat odio. Donec fringilla mi dignissim quam eleifend mattis. Sed ligula nibh, tincidunt nec dictum ultricies, rutrum at dui. Sed hendrerit nulla sit amet leo facilisis interdum. Aenean sagittis at ex id auctor. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Sed sed metus id urna ultrices imperdiet sed id enim. Suspendisse rhoncus ex lorem, et commodo turpis sollicitudin blandit.
          </p>

          <p>
            Morbi eu ullamcorper sapien. Aenean vitae vestibulum orci. Sed in volutpat urna. Aliquam erat volutpat. Pellentesque aliquet sit amet massa ut tempor. Aenean sit amet magna efficitur, sollicitudin tellus tincidunt, blandit lectus. Aliquam in nulla et metus bibendum euismod non et dui. Integer posuere porta ligula, et iaculis lectus lacinia vitae. Aliquam erat volutpat.
          </p>

          <p>
            Integer faucibus, leo sit amet facilisis tempus, dolor enim porttitor lorem, sit amet facilisis dui neque in mi. Morbi nisl metus, cursus quis quam id, tristique ullamcorper sem. Morbi vitae posuere massa, in tristique quam. Phasellus id laoreet nulla, vel ullamcorper ante. Cras nec augue sed metus tincidunt fringilla non eu turpis. In quis est tellus. Vestibulum eget fringilla lorem, porttitor faucibus neque. Nam congue, libero id pulvinar hendrerit, mi eros malesuada nibh, a euismod eros enim et magna. Etiam nec placerat nunc. Integer porttitor mauris ut mi vehicula, lobortis pulvinar leo scelerisque. Suspendisse maximus lorem nec ornare tincidunt.
          </p>

          <p>
            Sed interdum vitae ante nec consectetur. Quisque elementum tortor erat, condimentum gravida massa commodo non. Maecenas eget ante vel purus suscipit volutpat. Nulla vulputate euismod urna sit amet tristique. Morbi rhoncus urna et erat varius, non bibendum tortor fermentum. Proin finibus ligula quis ipsum tempus laoreet. Aenean ipsum neque, mollis et tortor in, lobortis hendrerit est. In sed commodo nunc.
          </p>
        </Drawer>      
      </React.StrictMode>
    </>
  )
}

ReactDOM.render(<Demo />, document.getElementById("app-root"));