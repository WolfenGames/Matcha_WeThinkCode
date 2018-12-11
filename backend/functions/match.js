function matchTags(p1, p2, cb)
{
	cb(
		((p1.MatchingTags > p2.MatchingTags) ? p2.MatchingTags : p1.MatchingTags)/
		((p1.total > p2.total) ? p2.total : p1.total) * 70
	)
}

function matchDist(p1, p2, cb)
{
	cb(
		((p1.Max - p2.Dist)/p1.Max) * 0
	)
}

module.exports = {
	matchTags: matchTags,
	matchDist: matchDist
}