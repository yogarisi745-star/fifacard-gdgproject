// Standard Player Image Mapping by Token ID and Player Name

export const PLAYER_IMAGE_MAP = {
  1: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrP_H4LoazkM_KBECSaTLjd89P9z_sKdZPJdhZrNX40mUEXQOFgyUkVRwa&s=10",
  2: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBNaaZpfRCbEnkxp-kWL7zBqTVzQwvdLTjrWoqHum-hqKiGdXxloji_Cg&s=10",
  3: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7pjJftBpC1M-i1a1JXQHfkhwrGv8f1yYTvrseLhSHc7BDXzdIU90zQ8Vl&s=10",
  4: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMXzG8tTnrnbiAQa6CdEydfod4Lm4ApgpOnYxq_izlRA&s=10",
  5: "https://pbs.twimg.com/media/GGSa8fxWcAAn9xX.jpg",
  6: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQO2lA1AYkflQhZCTuOkcXFOA2QiX5VVET7LP457kXF-t_uzoNL7vj3WQs&s=10",
  7: "https://d4f7y6nbupj5z.cloudfront.net/wp-content/uploads/2022/06/VanDijk-1.jpg",
  8: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjNrj52yIxe4hGzJL-F8A_MBWPRJTzc4UOpDCVpOR-bQ&s=10",
  9: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqDp53xH6dyMvROCXexGCMFeh4WhxqhecdH8U0LvnlThPXHzuOydzh17k&s=10",
  10: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTn_DBJlGPVg19i-GVCv-mEYwrsT4S4KH8DAwmmw6wo0s5HrrasNKYt6KE&s=10",
  11: "https://ichef.bbci.co.uk/ace/standard/1008/cpsprodpb/d228/live/9d30d220-0954-11ef-b6ce-2bc209dc2066.jpg",
  12: "https://wallpapers.com/images/hd/alisson-becker-pointing-qlgy4j8906rvh7j6.jpg"
};

export const PLAYER_NAME_IMAGE_MAP = {
  "lionel messi": PLAYER_IMAGE_MAP[1],
  "cristiano ronaldo": PLAYER_IMAGE_MAP[2],
  "kylian mbappé": PLAYER_IMAGE_MAP[3],
  "kylian mbappe": PLAYER_IMAGE_MAP[3],
  "erling haaland": PLAYER_IMAGE_MAP[4],
  "kevin de bruyne": PLAYER_IMAGE_MAP[5],
  "luka modrić": PLAYER_IMAGE_MAP[6],
  "luka modric": PLAYER_IMAGE_MAP[6],
  "virgil van dijk": PLAYER_IMAGE_MAP[7],
  "rúben dias": PLAYER_IMAGE_MAP[8],
  "ruben dias": PLAYER_IMAGE_MAP[8],
  "alphonso davies": PLAYER_IMAGE_MAP[9],
  "achraf hakimi": PLAYER_IMAGE_MAP[10],
  "thibaut courtois": PLAYER_IMAGE_MAP[11],
  "alisson becker": PLAYER_IMAGE_MAP[12]
};

export function getPlayerImageUrl(tokenId, name) {
  if (tokenId && PLAYER_IMAGE_MAP[String(tokenId)]) {
    return PLAYER_IMAGE_MAP[String(tokenId)];
  }
  if (name && PLAYER_NAME_IMAGE_MAP[String(name).toLowerCase()]) {
    return PLAYER_NAME_IMAGE_MAP[String(name).toLowerCase()];
  }
  return null;
}
