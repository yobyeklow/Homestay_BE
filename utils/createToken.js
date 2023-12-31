import jwt from 'jsonwebtoken'

async function createToken(user) {
  const accessToken = jwt.sign(
    {
      id: user._id,
      Customer: user?.Customer,
      Host: user?.Host,
    },
    process.env.SECRET_KEY,
    { expiresIn: "1h" }
  );
  const refreshToken = await jwt.sign(
    {
      id: user._id,
      Customer: user?.Customer,
      Host: user?.Host,
    },
    process.env.JWT_REFRESH_TOKEN,
    { expiresIn: "365d" }
  );
  return { accessToken, refreshToken };
}

export default createToken