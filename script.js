body {
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #000;
  color: #fff;
  font-family: Arial, sans-serif;
  overflow: hidden;
}

.container {
  position: relative;
  text-align: center;
}

#image {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
  border: 5px solid white;
}

#bpm {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 10px;
  border-radius: 5px;
  font-size: 1.5em;
}
