export const colorMap = (id) => {
    const colorMap = [
        { name: 'music', color: "#808000" },
        { name: 'commentisfree', color: "#ffaf00" },
        { name: 'sport', color: "#00afff" },
        { name: 'football', color: "#00afff" },
        { name: 'books', color: "#808000" },
        { name: 'film', color: "#808000" },
        { name: 'tv-and-radio', color: "#808000" },
        { name: 'lifeandstyle', color: "#af5f87" },
        { name: 'money', color: "#af5f87" },
        { name: 'food', color: "#af5f87" },
    ]
    const firstIdSection = id.substring(0, id.indexOf('/'));
    console.log(firstIdSection)

    const possibleColor = colorMap.find(item => item.name === firstIdSection)
    if (possibleColor) { 
        return possibleColor.color
    } 
    return 'red'
}